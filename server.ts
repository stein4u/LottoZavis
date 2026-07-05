import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { queryDraws, enrichDraw, parseContainsNumber } from "./server/lotto/drawsApi.js";
import { ensureLottoData, getCacheSnapshot, incrementalRefresh } from "./server/lotto/ingest.js";
import { computeStats, parseStatsWindow } from "./server/lotto/statsEngine.js";
import { buildNumberProfile } from "./server/lotto/numberProfile.js";
import { generatePrediction } from "./server/lotto/predictEngine.js";
import { getWikiPage, parseWikiNav } from "./server/wiki/wikiReader.js";
import {
  buildWikiAskPrompt,
  getWikiIndexMeta,
  initWikiIndex,
  retrieveWikiChunks,
} from "./server/wiki/wikiIndex.js";

// Initialize Gemini API SDK if key exists
let ai: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. LLM capabilities will be restricted.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  await ensureLottoData();
  initWikiIndex();

  app.get("/api/lotto-stats", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ error: "Lotto draw data is not loaded yet." });
    }

    const window = parseStatsWindow(req.query.window);
    if (window === null) {
      return res.status(400).json({ error: "Invalid window. Use all, 50, 100, or 200." });
    }

    res.json(computeStats(cache.draws, window, cache.lastUpdated));
  });

  app.get("/api/lotto-stats/number/:n", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ error: "Lotto draw data is not loaded yet." });
    }

    const number = Number(req.params.n);
    if (!Number.isInteger(number) || number < 1 || number > 45) {
      return res.status(400).json({ error: "Invalid number. Use 1-45." });
    }

    const window = parseStatsWindow(req.query.window);
    if (window === null) {
      return res.status(400).json({ error: "Invalid window. Use all, 50, 100, or 200." });
    }

    res.json(buildNumberProfile(cache.draws, window, number));
  });

  app.get("/api/draws", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ error: "Lotto draw data is not loaded yet." });
    }

    const from = req.query.from !== undefined ? Number(req.query.from) : undefined;
    const to = req.query.to !== undefined ? Number(req.query.to) : undefined;
    const limit = req.query.limit !== undefined ? Math.min(Number(req.query.limit), 100) : 20;
    const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
    const contains = parseContainsNumber(req.query.contains);

    if (contains === null) {
      return res.status(400).json({ error: "Invalid contains. Use a number between 1 and 45." });
    }

    if (Number.isNaN(limit) || Number.isNaN(offset) || (from !== undefined && Number.isNaN(from)) || (to !== undefined && Number.isNaN(to))) {
      return res.status(400).json({ error: "Invalid query parameters." });
    }

    res.json(queryDraws(cache.draws, { from, to, limit, offset, contains }));
  });

  app.get("/api/draws/latest", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ error: "Lotto draw data is not loaded yet." });
    }

    const latest = [...cache.draws].sort((a, b) => b.round - a.round)[0];
    res.json(enrichDraw(latest));
  });

  app.post("/api/admin/refresh", async (req, res) => {
    try {
      const result = await incrementalRefresh();
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Refresh failed." });
    }
  });

  app.get("/api/wiki/pages", (_req, res) => {
    res.json({ pages: parseWikiNav() });
  });

  app.get("/api/wiki/page", (req, res) => {
    const id = String(req.query.id ?? "").trim();
    if (!id) {
      return res.status(400).json({ error: "Missing id query parameter." });
    }

    const page = getWikiPage(id);
    if (!page) {
      return res.status(404).json({ error: "Wiki page not found." });
    }

    const navItem = parseWikiNav().find((item) => item.id === page.id);
    res.json({ ...page, category: navItem?.category ?? page.category });
  });

  // Statistical recommendation backed by real draw statistics
  app.post("/api/predict", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ success: false, error: "Lotto draw data is not loaded yet." });
    }

    const window = parseStatsWindow(req.body.window);
    if (window === null) {
      return res.status(400).json({ success: false, error: "Invalid window. Use all, 50, 100, or 200." });
    }

    const { modelType, oddEvenBias, hotColdBias, excludeNumbers = [] } = req.body;
    const stats = computeStats(cache.draws, window, cache.lastUpdated);

    const result = generatePrediction(stats, {
      modelType: modelType ?? "random_forest",
      oddEvenBias: oddEvenBias ?? "balanced",
      hotColdBias: hotColdBias ?? "balanced",
      excludeNumbers,
    });

    res.json(result);
  });

  // LLM Wiki enrichment endpoint
  app.post("/api/wiki/generate", async (req, res) => {
    const { pageId, title, currentContent } = req.body;
    
    if (!ai) {
      return res.status(200).json({
        success: false,
        error: "Gemini API key가 등록되어 있지 않습니다. .env 파일에 GEMINI_API_KEY를 추가해 주세요.",
        enrichedContent: currentContent + "\n\n*(시스템 알림: LLM API가 연결되지 않아 기본 내용만 표시됩니다. AI 기능을 활용하려면 환경 변수 키를 등록하십시오.)*"
      });
    }

    try {
      const prompt = `
        당신은 LottoZavis 로또 분석 위키 편집 보조 AI입니다.
        아래 위키 문서를 기반으로, **POLICY 톤**을 지켜 2~3개 단락을 추가하세요.

        반드시 지킬 것:
        - 로또는 확률 게임이며 1등 확률 1/8,145,060은 변하지 않음
        - cryingbird 방법론 = 조합 공간 축소·필터링 프레임
        - LottoZavis Predictor = 실데이터 빈도 기반 가중 추천(weighted-random), 당첨 보장 없음

        하지 말 것:
        - LSTM/RF/XGBoost 학습으로 당첨 확률 상승 주장
        - precision/recall/F1/confidence 등 ML 평가 지표를 사실처럼 제시
        - "확실한 당첨법", "다음 회차 반드시 나온다" 등 표현

        마크다운으로 한국어 작성. 기존 내용 아래 "### AI 보조 해설" 제목으로 덧붙이세요.

        [문서 ID]: ${pageId}
        [제목]: ${title}
        [기존 내용]:
        ${currentContent}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const text = response.text || "";
      res.json({
        success: true,
        enrichedContent: currentContent + "\n\n" + text
      });
    } catch (error: any) {
      console.error("Gemini content generation failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "콘텐츠를 생성하는 중 오류가 발생했습니다."
      });
    }
  });

  app.get("/api/wiki/index-meta", (_req, res) => {
    res.json(getWikiIndexMeta());
  });

  // LLM Q&A search query (wiki corpus RAG)
  app.post("/api/wiki/ask", async (req, res) => {
    const { question } = req.body;
    const trimmedQuestion = String(question ?? "").trim();

    if (!trimmedQuestion) {
      return res.status(400).json({ success: false, error: "Question is required." });
    }

    if (!ai) {
      return res.status(200).json({
        success: false,
        error: "Gemini API key가 등록되어 있지 않습니다. .env 파일에 GEMINI_API_KEY를 추가해 주세요.",
        answer: "Gemini API key가 제공되지 않아 AI의 답변을 작성할 수 없습니다. 관리자에게 문의하여 환경 변수를 설정하세요.",
        citations: [],
        coverage: "none",
      });
    }

    try {
      const retrieval = retrieveWikiChunks(trimmedQuestion);
      const prompt = buildWikiAskPrompt(trimmedQuestion, retrieval.chunks, retrieval.coverage);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const answerText = response.text || "";
      res.json({
        success: true,
        answer: answerText,
        citations: retrieval.citations,
        coverage: retrieval.coverage,
      });
    } catch (error: any) {
      console.error("Gemini Q&A failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "답변을 구상하는 도중 오류가 발생했습니다.",
      });
    }
  });

  // Serve Vite or build artifacts
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
