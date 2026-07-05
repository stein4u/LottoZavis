## 1. Wiki search index

- [ ] 1.1 Create `server/wiki/wikiIndex.ts` with chunk types (`pageId`, `title`, `section`, `tierHint`, `text`)
- [ ] 1.2 Implement H2 chunking from `getWikiPage` / `readPageFile` bodies
- [ ] 1.3 Implement `tierHint` detection (Tier A: `tier-a` tag or `*-tier-a-*` id; Tier B: legacy callout text)
- [ ] 1.4 Implement `buildWikiIndex()` scanning `llm-wiki-lotto/wiki/**/*.md`
- [ ] 1.5 Implement `retrieveWikiChunks(question, k)` with keyword scoring + nav summary boost
- [ ] 1.6 Add Tier A boost / Tier B penalty for stat keywords (빈도, freq, Tier, 회차, absence, co-occurrence)
- [ ] 1.7 Always include `POLICY` chunk in retrieval context
- [ ] 1.8 Rebuild index on server startup; refresh when wiki mtime is newer than `builtAt`

## 2. Ask API (RAG)

- [ ] 2.1 Add optional `GET /api/wiki/index-meta` (`pageCount`, `chunkCount`, `builtAt`) for debugging
- [ ] 2.2 Refactor `POST /api/wiki/ask` to retrieve chunks before Gemini call
- [ ] 2.3 Build generation prompt with numbered CONTEXT excerpts + POLICY tone rules
- [ ] 2.4 Return extended JSON: `{ success, answer, citations[], coverage }`
- [ ] 2.5 Set `coverage: none` when retrieval score below threshold; answer must not invent stats
- [ ] 2.6 Map citations to `{ id, title, excerpt }` from retrieved chunks

## 3. WikiTab UI

- [ ] 3.1 Extend `src/lib/wikiApi.ts` types for ask response (`citations`, `coverage`)
- [ ] 3.2 Render **참고 위키** citation chips below AI answer; click navigates via `navigateToPage`
- [ ] 3.3 Show notice when `coverage === 'none'`
- [ ] 3.4 Update AI panel label/copy to wiki-query framing (not generic ML)

## 4. Documentation

- [ ] 4.1 Update `llm-wiki-lotto/AGENTS.md` workflow table: app Query → `/api/wiki/ask` (read-only; agent ingest/lint unchanged)
- [ ] 4.2 Update `wiki/overview.md` Phase 2 status and `wiki/log.md` entry

## 5. Verification

- [ ] 5.1 Manual test: "Tier A와 Tier B 차이" → cites `POLICY`
- [ ] 5.2 Manual test: "1231회 TOP 빈도" → cites `frequency-snapshot-tier-a-*`, not Tier B legacy
- [ ] 5.3 Manual test: off-topic question → `coverage: none`, no fabricated numbers
- [ ] 5.4 Run `npm run lint`
- [ ] 5.5 Run `openspec validate wiki-phase-2-rag`

## 6. Archive

- [ ] 6.1 Sync delta spec to `openspec/specs/llm-wiki-content/spec.md`
- [ ] 6.2 Run `/opsx:archive wiki-phase-2-rag`
