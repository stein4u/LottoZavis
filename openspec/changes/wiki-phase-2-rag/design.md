## Context

**Done:** Phase 0 (policy), 0.5 (Tier A analyses), 1 (WikiTab Reader via `GET /api/wiki/pages` + `GET /api/wiki/page`).

**Now:** `POST /api/wiki/ask` sends `{ question }` to Gemini with POLICY tone only. The wiki corpus (~31 pages, ~80KB under `llm-wiki-lotto/wiki/`) is not searched.

**Target behavior:** Replicate agent `wiki-query` Steps 1–2 on the server, using the same corpus that `wiki-ingest` / `wiki-lint` keep current. See `llm-wiki-lotto/AGENTS.md` for schema, roles, and 금지 사항.

```
┌─────────────────────────────────────────────────────────────┐
│  MAINTENANCE (Cursor Agent — unchanged)                      │
│  wiki-ingest → wiki/   wiki-lint → quality   Tier A scripts │
└────────────────────────────┬────────────────────────────────┘
                             │ git: wiki/ + AGENTS.md
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  RUNTIME (LottoZavis)                                        │
│  wikiReader (Phase 1) + wikiIndex (Phase 2)                  │
│    ├── GET  /api/wiki/pages|page                               │
│    └── POST /api/wiki/ask  ← retrieve → Gemini → citations   │
└────────────────────────────┬────────────────────────────────┘
                             ▼
                        WikiTab Ask panel
```

## Goals / Non-Goals

**Goals:**

- Implement wiki-query **Step 1** (index + search) and **Step 2** (cited synthesis) in `/api/wiki/ask`.
- Always inject `POLICY.md` (or summary) into the generation context.
- Return structured **citations** for WikiTab navigation.
- Prefer Tier A canonical content for bonus-inclusive stat questions.
- Refuse hallucination when no relevant chunks match (suggest ingest/query to user).

**Non-Goals (Phase 2a):**

- Agent-side `analyses/` / `log.md` writes from the app.
- Vector embeddings or external vector DB.
- `/api/lotto-stats` hybrid context (Phase 2b).
- RAG for `/api/wiki/generate`.
- Committing or modifying `raw/` from the server.

## Decisions

### 1. Retrieval: keyword + index (not embeddings)

**Choice:** BM25-lite / TF keyword scoring over page metadata + H2 chunks; `parseWikiNav()` summaries as Step 1a filter.

**Rationale:** Corpus is small (~80KB). Matches Karpathy LLM Wiki at this scale. No new dependencies. Korean queries work reasonably on titles/tags (`빈도`, `Tier A`, `1231`).

**Alternatives deferred:** Gemini embeddings (Phase 2c if corpus grows after raw ingest expansion).

### 2. Chunking: H2 sections

**Choice:** Split each wiki page body on `## ` headings; attach frontmatter `title`, `description`, `type`, `tags` to every chunk.

**Rationale:** Long `sources/*` pages (e.g. cryingbird collection) need sub-page granularity. H2 matches how wiki pages are authored.

**Chunk metadata:**

```ts
{ pageId, title, section, type, tags, tierHint: 'A' | 'B' | 'neutral', text }
```

`tierHint`: `A` if `tier-a` tag or `*-tier-a-*` id; `B` if body contains `Tier B legacy`; else `neutral`.

### 3. Retrieval pipeline (wiki-query Step 1)

```
question
  → tokenize (lowercase, simple split; Korean chars kept)
  → score index nav items (title + summary + category)
  → score all chunks (title + section + text + tag boost)
  → boost: POLICY always included
  → boost: tierHint A (+) for stat keywords (빈도, freq, Tier, 회차, absence, co-occurrence)
  → penalty: tierHint B for same keywords
  → top-k chunks (default k=5, max ~8k chars context budget)
  → if max score < threshold → coverage: none
```

Optional **1-hop wikilink expansion:** if a top chunk's page links `[[concepts/foo]]`, include that page's lead chunk at lower priority (cap total chunks).

### 4. Generation (wiki-query Step 2)

**Prompt structure:**

1. POLICY tone rules (existing Phase 1 text).
2. `CONTEXT` block: numbered excerpts with `[1] pageId — title — section`.
3. User question.
4. Instructions: answer only from CONTEXT; cite as `[[page-id]]`; if insufficient, say so.

**Model:** `gemini-2.5-flash` (unchanged).

### 5. API response shape

**Choice:** Extend JSON (backward compatible for WikiTab):

```json
{
  "success": true,
  "answer": "markdown with [[wikilinks]]",
  "citations": [
    { "id": "concepts/frequency-deviation", "title": "빈도 이격", "excerpt": "…" }
  ],
  "coverage": "ok"
}
```

`coverage`: `none` when retrieval threshold not met → `success: true` but answer explains wiki gap (no fabricated stats).

**BREAKING:** None for clients that ignore new fields. WikiTab will consume `citations`.

### 6. Index lifecycle

**Choice:** Build index on server startup via `buildWikiIndex()`; expose `GET /api/wiki/index-meta` optional `{ pageCount, chunkCount, builtAt }` for debugging.

**Dev:** Rebuild if any `wiki/**/*.md` mtime > index `builtAt` (simple stat check on first ask or startup).

**Not chosen:** File watcher process (unnecessary for MVP).

Ingest/lint flow: agent updates `wiki/` → commit → deploy/restart (or dev mtime trigger) → fresh index.

### 7. WikiTab UI

**Choice:** Below AI answer, render **참고 위키** chips from `citations[]`; click → `navigateToPage(id)`.

Show muted notice when `coverage === 'none'`.

Label panel **AI 탐색기 (wiki-query)** instead of "Phase 2 preview".

Firebase Q&A archive: store `citations` JSON on `saveQAItem` if schema allows (optional stretch).

### 8. Agent vs app boundary (AGENTS.md)

| Action | Agent (skills) | App (Phase 2) |
|--------|----------------|---------------|
| Ingest raw → wiki | wiki-ingest | — |
| Lint / drift report | wiki-lint | — |
| Tier A refresh | scripts | — |
| User Q&A | wiki-query (can write analyses/) | `/api/wiki/ask` (read-only wiki) |
| Index maintenance | — | server rebuild |

Document in `AGENTS.md` workflow table: **Query (app)** → `/api/wiki/ask`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Tier B stats cited for frequency questions | Tier A boost + legacy penalty + POLICY in context |
| Stale wiki vs app cache | lint "오래됨"; Tier A script refresh; Phase 2b live stats |
| Keyword miss on semantic queries ("이격이 뭐야") | Index includes concept titles; 1-hop wikilink; later embeddings |
| Context overflow on large k | Char budget cap; prioritize highest scores |
| Gemini ignores CONTEXT | Low temperature; explicit "CONTEXT-only" instruction; cite check in tests |
| Index stale after ingest without restart | mtime rebuild in dev; document restart after wiki commit |

## Migration Plan

1. Implement `wikiIndex.ts` + unit tests for retrieve scoring.
2. Wire `/api/wiki/ask` retrieval + new response fields.
3. Update WikiTab citations UI + `wikiApi` types.
4. Update `AGENTS.md`, `overview.md`, `log.md`.
5. Manual test matrix (see below).
6. Archive change → sync `llm-wiki-content` spec delta.

## Test Matrix (manual)

| Question | Expected citations |
|----------|------------------|
| "Tier A와 Tier B 차이는?" | `POLICY` |
| "1231회 TOP 빈도 번호는?" | `frequency-snapshot-tier-a-*` (not Tier B legacy) |
| "빈도 이격이 뭐야?" | `concepts/frequency-deviation` |
| "LSTM으로 당첨률 올릴 수 있어?" | POLICY tone refusal / no ML win claims |
| Nonsense / off-topic | `coverage: none` |

## Open Questions

1. **Phase 2b:** Include `/api/lotto-stats` snapshot in context for "최신 빈도" questions?
2. **Firebase:** Persist `citations[]` on Q&A items?
3. **Threshold tuning:** Fixed score cutoff vs relative (top score < 40% of best)?

Default for 2a: wiki-only; relative threshold; citations in API only (not Firebase).
