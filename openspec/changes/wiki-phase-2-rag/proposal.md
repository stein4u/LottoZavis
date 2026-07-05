## Why

Phase 1 connected WikiTab to `llm-wiki-lotto/wiki/` as a Reader, but `POST /api/wiki/ask` still calls Gemini with POLICY tone only—no wiki corpus. Users expect the same behavior as the agent `wiki-query` skill (index → relevant pages → cited synthesis), fed by content maintained via `wiki-ingest` and `wiki-lint`. Phase 2 closes that gap so app Q&A is grounded in the published wiki, not model parametric knowledge.

## What Changes

- Add a **wiki search index** over `llm-wiki-lotto/wiki/` (chunked, rebuilt from on-disk markdown).
- Extend `POST /api/wiki/ask` to **retrieve top-k chunks**, inject POLICY + context into Gemini, and return **citations** (page id, title, excerpt).
- Return **coverage** signal (`ok` | `partial` | `none`) and refuse to invent facts when retrieval is empty (aligned with `AGENTS.md` 금지 사항).
- Prefer **Tier A canonical** pages for frequency/stat questions (boost `*-tier-a-*`, penalize Tier B legacy callouts).
- Update WikiTab AI panel to show **clickable citation links** (reuse Phase 1 page navigation).
- Align Gemini system prompts with `wiki-query` Step 2 (cite `[[page-id]]`, no ML win claims).

**Non-goals (Phase 2a):**

- Replacing agent `wiki-ingest` / `wiki-lint` (maintenance stays Cursor skills).
- Writing `analyses/` or `log.md` from the app (agent `wiki-query` only).
- Embedding/vector DB (corpus ~80KB; keyword + index retrieval first).
- Hybrid live stats from `/api/lotto-stats` (deferred to Phase 2b).
- RAG for `POST /api/wiki/generate` (Enrich stays separate).

## Capabilities

### New Capabilities

<!-- None — RAG extends existing wiki content + ask API -->

### Modified Capabilities

- `llm-wiki-content`: Add requirements for corpus-backed `/api/wiki/ask`, citation format, POLICY/tier retrieval rules, and empty-retrieval behavior.

## Impact

- **Server**: New `server/wiki/wikiIndex.ts` (or equivalent), changes to `server.ts` `/api/wiki/ask`, index rebuild on startup (and optional wiki mtime refresh in dev).
- **Client**: `WikiTab.tsx`, `src/lib/wikiApi.ts` — parse/display citations; optional `coverage` messaging.
- **Documentation**: `llm-wiki-lotto/AGENTS.md` — note app RAG mirrors `wiki-query` Steps 1–2; `wiki/overview.md` Phase 2 status.
- **Specs**: Delta to `openspec/specs/llm-wiki-content/spec.md` on archive.
- **Dependencies**: No new npm packages for Phase 2a (keyword retrieval). Existing `@google/genai` unchanged.
- **Maintenance loop**: Unchanged — ingest/lint/Tier A scripts update `wiki/`; server index reflects disk on rebuild.
