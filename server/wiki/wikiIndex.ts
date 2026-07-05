import fs from "fs";
import path from "path";
import { getWikiPage, listWikiPageIds, parseWikiNav, readPageFile } from "./wikiReader.js";

const WIKI_ROOT = path.join(process.cwd(), "llm-wiki-lotto", "wiki");

export type TierHint = "A" | "B" | "neutral";
export type WikiCoverage = "ok" | "partial" | "none";

export interface WikiChunk {
  pageId: string;
  title: string;
  section: string;
  type?: string;
  tags: string[];
  tierHint: TierHint;
  text: string;
}

export interface WikiIndex {
  chunks: WikiChunk[];
  builtAt: string;
  pageCount: number;
}

export interface WikiIndexMeta {
  pageCount: number;
  chunkCount: number;
  builtAt: string;
}

export interface WikiCitation {
  id: string;
  title: string;
  excerpt: string;
}

export interface RetrieveResult {
  chunks: WikiChunk[];
  citations: WikiCitation[];
  coverage: WikiCoverage;
}

const STAT_KEYWORDS = [
  "빈도",
  "freq",
  "frequency",
  "tier",
  "회차",
  "absence",
  "co-occurrence",
  "cooccurrence",
  "미출현",
  "구간",
  "통계",
];

const DEFAULT_K = 5;
const MAX_CONTEXT_CHARS = 8000;
const SCORE_THRESHOLD = 2;

let cachedIndex: WikiIndex | null = null;

function titleFromId(id: string): string {
  const base = id.split("/").pop() ?? id;
  return base.replace(/-/g, " ");
}

function getWikiLatestMtime(): number {
  if (!fs.existsSync(WIKI_ROOT)) return 0;

  let latest = 0;
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        latest = Math.max(latest, fs.statSync(full).mtimeMs);
      }
    }
  }

  walk(WIKI_ROOT);
  return latest;
}

function detectTierHint(pageId: string, tags: string[], body: string): TierHint {
  if (tags.some((tag) => tag.toLowerCase() === "tier-a") || pageId.includes("-tier-a-")) {
    return "A";
  }
  if (/Tier B legacy/i.test(body)) {
    return "B";
  }
  return "neutral";
}

function chunkPageBody(
  pageId: string,
  title: string,
  type: string | undefined,
  tags: string[],
  body: string
): WikiChunk[] {
  const tierHint = detectTierHint(pageId, tags, body);
  const chunks: WikiChunk[] = [];
  const parts = body.split(/^## /m);

  if (parts.length === 1) {
    const text = body.trim();
    if (text) {
      chunks.push({ pageId, title, section: "(lead)", type, tags, tierHint, text });
    }
    return chunks;
  }

  const lead = parts[0].trim();
  if (lead) {
    chunks.push({ pageId, title, section: "(lead)", type, tags, tierHint, text: lead });
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newline = part.indexOf("\n");
    const section = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    const text = newline === -1 ? section : part.slice(newline + 1).trim();
    if (section || text) {
      chunks.push({
        pageId,
        title,
        section: section || "(section)",
        type,
        tags,
        tierHint,
        text: text || section,
      });
    }
  }

  return chunks;
}

export function buildWikiIndex(): WikiIndex {
  const pageIds = listWikiPageIds();
  const chunks: WikiChunk[] = [];

  for (const pageId of pageIds) {
    const parsed = readPageFile(pageId);
    if (!parsed) continue;

    const title = String(parsed.meta.title ?? titleFromId(pageId));
    const type = parsed.meta.type ? String(parsed.meta.type) : undefined;
    const tags = Array.isArray(parsed.meta.tags)
      ? parsed.meta.tags.map(String)
      : parsed.meta.tags
        ? [String(parsed.meta.tags)]
        : [];

    chunks.push(...chunkPageBody(pageId, title, type, tags, parsed.body));
  }

  return {
    chunks,
    builtAt: new Date().toISOString(),
    pageCount: pageIds.length,
  };
}

function indexNeedsRebuild(): boolean {
  if (!cachedIndex) return true;
  const wikiMtime = getWikiLatestMtime();
  return wikiMtime > new Date(cachedIndex.builtAt).getTime();
}

export function ensureWikiIndex(): WikiIndex {
  if (indexNeedsRebuild()) {
    cachedIndex = buildWikiIndex();
  }
  return cachedIndex!;
}

export function initWikiIndex(): WikiIndex {
  cachedIndex = buildWikiIndex();
  console.log(
    `Wiki search index ready: ${cachedIndex.pageCount} pages, ${cachedIndex.chunks.length} chunks`
  );
  return cachedIndex;
}

export function getWikiIndexMeta(): WikiIndexMeta {
  const index = ensureWikiIndex();
  return {
    pageCount: index.pageCount,
    chunkCount: index.chunks.length,
    builtAt: index.builtAt,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}"'`~\/\\|+=<>@#$%^&*_-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function questionHasStatKeywords(question: string): boolean {
  const lower = question.toLowerCase();
  return STAT_KEYWORDS.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function scoreText(text: string, tokens: string[]): number {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (token.length >= 2 && haystack.includes(token)) {
      score += token.length >= 4 ? 2 : 1;
    }
  }
  return score;
}

function scoreChunk(chunk: WikiChunk, tokens: string[], navBoost: number, statQuestion: boolean): number {
  let score =
    scoreText(`${chunk.title} ${chunk.section}`, tokens) * 3 +
    scoreText(chunk.text, tokens) +
    scoreText(chunk.tags.join(" "), tokens) * 2 +
    navBoost;

  if (statQuestion) {
    if (chunk.tierHint === "A") score += 3;
    if (chunk.tierHint === "B") score -= 2;
  }

  if (chunk.pageId === "POLICY") {
    score += 1;
  }

  return score;
}

function makeExcerpt(text: string, maxLen = 120): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1)}…`;
}

function buildNavBoostMap(tokens: string[]): Map<string, number> {
  const boosts = new Map<string, number>();
  for (const item of parseWikiNav()) {
    const navScore =
      scoreText(`${item.title} ${item.summary} ${item.category}`, tokens) * 2;
    if (navScore > 0) {
      boosts.set(item.id, Math.max(boosts.get(item.id) ?? 0, navScore));
    }
  }
  return boosts;
}

function chunksForPage(chunks: WikiChunk[], pageId: string): WikiChunk[] {
  return chunks.filter((chunk) => chunk.pageId === pageId);
}

function selectTopChunks(
  scored: Array<{ chunk: WikiChunk; score: number }>,
  k: number,
  maxChars: number
): WikiChunk[] {
  const selected: WikiChunk[] = [];
  const seenPages = new Set<string>();
  let charCount = 0;

  for (const { chunk, score } of scored) {
    if (score <= 0) continue;
    if (selected.length >= k) break;
    if (seenPages.has(chunk.pageId) && selected.some((item) => item.pageId === chunk.pageId && item.section === chunk.section)) {
      continue;
    }

    const nextLen = charCount + chunk.text.length;
    if (selected.length > 0 && nextLen > maxChars) continue;

    selected.push(chunk);
    seenPages.add(chunk.pageId);
    charCount = nextLen;
  }

  return selected;
}

function buildCitations(chunks: WikiChunk[]): WikiCitation[] {
  const byPage = new Map<string, WikiCitation>();
  for (const chunk of chunks) {
    if (byPage.has(chunk.pageId)) continue;
    byPage.set(chunk.pageId, {
      id: chunk.pageId,
      title: chunk.title,
      excerpt: makeExcerpt(chunk.text),
    });
  }
  return [...byPage.values()];
}

function getPolicyChunks(allChunks: WikiChunk[]): WikiChunk[] {
  return chunksForPage(allChunks, "POLICY");
}

export function retrieveWikiChunks(question: string, k = DEFAULT_K): RetrieveResult {
  const index = ensureWikiIndex();
  const tokens = tokenize(question);
  const statQuestion = questionHasStatKeywords(question);
  const navBoosts = buildNavBoostMap(tokens);

  const scored = index.chunks.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, tokens, navBoosts.get(chunk.pageId) ?? 0, statQuestion),
  }));

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0]?.score ?? 0;

  let coverage: WikiCoverage = "ok";
  if (bestScore < SCORE_THRESHOLD) {
    coverage = "none";
  } else if (bestScore < SCORE_THRESHOLD * 2) {
    coverage = "partial";
  }

  const policyChunks = getPolicyChunks(index.chunks);
  let selected = selectTopChunks(scored, k, MAX_CONTEXT_CHARS);

  for (const policyChunk of policyChunks) {
    if (!selected.some((chunk) => chunk.pageId === policyChunk.pageId)) {
      selected = [policyChunk, ...selected].slice(0, k + 1);
    }
  }

  if (coverage === "none") {
    selected = policyChunks.length > 0 ? policyChunks.slice(0, 1) : selected.slice(0, 1);
  }

  return {
    chunks: selected,
    citations: buildCitations(selected),
    coverage,
  };
}

export function getPolicyContextText(): string {
  const page = getWikiPage("POLICY");
  return page?.content ?? "";
}

export function buildWikiAskPrompt(question: string, chunks: WikiChunk[], coverage: WikiCoverage): string {
  const policyText = getPolicyContextText();
  const contextBlock = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.pageId} — ${chunk.title} — ${chunk.section}\n${chunk.text.slice(0, 1800)}`
    )
    .join("\n\n");

  const coverageInstruction =
    coverage === "none"
      ? "위키에서 질문과 직접 관련된 내용을 찾지 못했습니다. CONTEXT에 없는 통계·번호를 절대 만들지 말고, 위키에 해당 정보가 없음을 솔직히 알리세요."
      : "답변은 반드시 CONTEXT에 있는 내용만 근거로 하세요. CONTEXT에 없는 통계·번호를 만들지 마세요.";

  return `
당신은 LottoZavis 로또 분석 위키 wiki-query 보조 AI입니다.
**POLICY 톤**으로 한국어 마크다운 답변을 작성하세요.

POLICY 요약:
${policyText.slice(0, 2500)}

CONTEXT:
${contextBlock || "(관련 위키 발췌 없음 — POLICY만 참고)"}

지침:
- ${coverageInstruction}
- 출처 인용은 [[page-id]] 형식 (예: [[POLICY]], [[concepts/frequency-deviation]])
- 로또는 확률 게임(1등 1/8,145,060), 당첨 보장 표현 금지
- LSTM/RF/XGBoost 학습으로 당첨률 상승, F1/confidence 등 ML 지표를 사실처럼 쓰지 마세요
- Predictor는 weighted-random 통계 추천(당첨 보장 없음)

질문: "${question}"
`.trim();
}
