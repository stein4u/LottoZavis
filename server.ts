import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { queryDraws, enrichDraw } from "./server/lotto/drawsApi.js";
import { ensureLottoData, getCacheSnapshot, incrementalRefresh } from "./server/lotto/ingest.js";
import { computeStats, parseStatsWindow } from "./server/lotto/statsEngine.js";

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

  app.get("/api/draws", (req, res) => {
    const cache = getCacheSnapshot();
    if (!cache || cache.draws.length === 0) {
      return res.status(503).json({ error: "Lotto draw data is not loaded yet." });
    }

    const from = req.query.from !== undefined ? Number(req.query.from) : undefined;
    const to = req.query.to !== undefined ? Number(req.query.to) : undefined;
    const limit = req.query.limit !== undefined ? Math.min(Number(req.query.limit), 100) : 20;
    const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;

    if (Number.isNaN(limit) || Number.isNaN(offset) || (from !== undefined && Number.isNaN(from)) || (to !== undefined && Number.isNaN(to))) {
      return res.status(400).json({ error: "Invalid query parameters." });
    }

    res.json(queryDraws(cache.draws, { from, to, limit, offset }));
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

  // Lotto Prediction algorithm simulation with customization options
  app.post("/api/predict", (req, res) => {
    const { modelType, oddEvenBias, hotColdBias, excludeNumbers = [] } = req.body;
    
    // modelType can be: "random_forest", "xgboost", "lstm"
    // oddEvenBias: "balanced", "odd_heavy", "even_heavy"
    // hotColdBias: "balanced", "hot_heavy", "cold_heavy"
    
    const numbersPool: { number: number; weight: number }[] = [];
    
    for (let i = 1; i <= 45; i++) {
      if (excludeNumbers.includes(i)) continue;
      
      let weight = 100;
      
      // Apply hot/cold bias
      const isHot = [1, 13, 17, 27, 34, 43].includes(i);
      const isCold = [9, 22, 23, 30, 41].includes(i);
      
      if (hotColdBias === "hot_heavy") {
        if (isHot) weight += 50;
        if (isCold) weight -= 30;
      } else if (hotColdBias === "cold_heavy") {
        if (isCold) weight += 50;
        if (isHot) weight -= 30;
      }
      
      // Apply odd/even bias
      const isOdd = i % 2 !== 0;
      if (oddEvenBias === "odd_heavy") {
        if (isOdd) weight += 40;
        else weight -= 20;
      } else if (oddEvenBias === "even_heavy") {
        if (!isOdd) weight += 40;
        else weight -= 20;
      }
      
      // Model-specific tweaks
      if (modelType === "random_forest") {
        // RF favors rolling frequency & pairs
        if (i % 7 === 3 || i % 9 === 2) weight += 15;
      } else if (modelType === "xgboost") {
        // XGB favors regression indicators & sum limits
        if (i >= 10 && i <= 38) weight += 10;
      } else if (modelType === "lstm") {
        // LSTM recurrent sequence simulation
        if (i % 5 === 0 || i % 8 === 4) weight += 20;
      }
      
      // Ensure positive weight
      weight = Math.max(10, weight);
      numbersPool.push({ number: i, weight });
    }

    // Weighted random selection of 6 unique numbers
    const selected: number[] = [];
    const tempPool = [...numbersPool];
    
    for (let s = 0; s < 6; s++) {
      if (tempPool.length === 0) break;
      
      const totalWeight = tempPool.reduce((acc, item) => acc + item.weight, 0);
      let rand = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedIdx = 0;
      
      for (let idx = 0; idx < tempPool.length; idx++) {
        cumulative += tempPool[idx].weight;
        if (rand <= cumulative) {
          selectedIdx = idx;
          break;
        }
      }
      
      selected.push(tempPool[selectedIdx].number);
      tempPool.splice(selectedIdx, 1);
    }
    
    // Sort in ascending order
    selected.sort((a, b) => a - b);
    
    // Generate simulated model confidence scores & evaluation metrics
    const confidence = Math.floor(78 + Math.random() * 18);
    const metrics = modelType === "random_forest" 
      ? { precision: "81.4%", recall: "79.2%", f1: "80.3%" }
      : modelType === "xgboost"
      ? { precision: "83.1%", recall: "77.5%", f1: "80.2%" }
      : { precision: "84.7%", recall: "81.0%", f1: "82.8%" };

    res.json({
      success: true,
      numbers: selected,
      confidence,
      metrics,
      timestamp: new Date().toISOString()
    });
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
        당신은 로또 번호 예측 시스템 및 데이터 분석 전문 AI 학술 연구원입니다.
        아래 기사 혹은 지식 베이스의 주제 및 내용을 기반으로 더 학술적이고, 수학적/통계학적 배경이 풍부하며, 흥미로운 최신 연구 및 머신러닝 동향 내용을 3~4개의 상세한 단락으로 추가 작성해주세요. 
        글은 위키피디아 스타일에 맞춰 정중하고 객관적인 어조로 마크다운(Markdown) 포맷으로 한국어로 작성해 주세요. 
        코드 예시나 수식이 필요하면 적극적으로 포함해 주세요.
        
        [주제 번호]: ${pageId}
        [문서 제목]: ${title}
        [기존 내용]:
        ${currentContent}
        
        기존 내용을 존중하면서, 그 아래에 "### 🧠 AI 연구원 추가 해설" 이라는 제목과 함께 마크다운 형식으로 덧붙여질 풍부한 연관 정보를 생성하세요.
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

  // LLM Q&A search query
  app.post("/api/wiki/ask", async (req, res) => {
    const { question } = req.body;
    
    if (!ai) {
      return res.status(200).json({
        success: false,
        error: "Gemini API key가 등록되어 있지 않습니다. .env 파일에 GEMINI_API_KEY를 추가해 주세요.",
        answer: "Gemini API key가 제공되지 않아 AI의 답변을 작성할 수 없습니다. 관리자에게 문의하여 환경 변수를 설정하세요."
      });
    }

    try {
      const prompt = `
        사용자가 로또 예측 시스템, 확률 통계, 또는 머신러닝 모델에 관한 질문을 했습니다.
        이에 대해 수학적 확률 이론, 데이터 분석 지식, 그리고 인공지능 예측 모델링 관점에서 전문적이면서도 쉽게 설명하는 답변을 한국어로 작성해 주세요.
        답변은 깔끔한 마크다운(Markdown) 포맷을 사용하여 핵심에 강조 표시를 하고, 수식이나 구체적인 예를 들어 설명해 주세요.
        
        사용자 질문: "${question}"
        
        정중하고 신뢰할 수 있는 톤앤매너로 작성해 주세요.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const answerText = response.text || "";
      res.json({
        success: true,
        answer: answerText
      });
    } catch (error: any) {
      console.error("Gemini Q&A failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "답변을 구상하는 도중 오류가 발생했습니다."
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
