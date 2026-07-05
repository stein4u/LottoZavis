## Context

`llm-wiki-lotto/` is a Karpathy-style LLM Wiki (Obsidian wikilinks, ingest/query/lint skills) sitting beside LottoZavis. The app uses real dhlottery data with **bonus-inclusive Tier A** stats; early wiki ingest used **main-six Tier B** scripts. Wiki content was untracked until Phase 0.

**Completed in commit `87edb8f`:** `POLICY.md`, drift callouts, `.gitignore`, wiki-only git commit, index/overview/log updates.

## Goals / Non-Goals

**Goals:**

- Document canonical Tier A/B rules aligned with `openspec/specs/lotto-stats`.
- Version-control `wiki/` + `AGENTS.md` only; keep `raw/` local.
- Label legacy Tier B analyses to prevent number confusion.
- Establish wiki tone as the future source for WikiTab (Phase 1).

**Non-Goals:**

- WikiTab Reader UI (Phase 1).
- RAG `/api/wiki/ask` (Phase 2).
- Tier A recomputation of analyses (Phase 0.5).
- Committing `raw/` or Python scripts to the app repo.

## Decisions

### 1. Policy lives in `wiki/POLICY.md`

**Choice:** Standalone policy page linked from `index.md` and `overview.md`, not only embedded in `AGENTS.md`.

**Rationale:** Readers and Phase 1 WikiTab can surface POLICY without agent-only AGENTS context. AGENTS.md gets a one-line pointer in directory structure.

### 2. Tier A / Tier B split (matches app)

| Tier | Includes bonus | Metrics |
|------|----------------|---------|
| **A** | Yes (7 balls) | frequency, absence, zone, co-occurrence |
| **B** | No (main 6) | odd/even, sum range, cryingbird historical examples |

**Expected value:** Tier A = `N×7÷45`, Tier B = `N×6÷45`.

Legacy wiki pages keep Tier B numbers with blockquote callouts; no silent rewrite in Phase 0.

### 3. Git scope

**Tracked:** `llm-wiki-lotto/AGENTS.md`, `llm-wiki-lotto/wiki/**`, `llm-wiki-lotto/.gitignore`

**Ignored:** `raw/`, `scripts/`, `.cursor/`, `.obsidian/` (root `.gitignore` + nested)

**Workflow:** Ingest locally → update `wiki/` → commit wiki only.

### 4. Drift callout format

Blockquote at top of affected pages:

```markdown
> **정책 drift (Tier B legacy)**  
> ... canonical Tier A — [[POLICY]]. Tier A 재산출은 Phase 0.5 예정.
```

**Affected pages:** `frequency-snapshot`, `freq-trend`, `dhlottery-official-draws` (snapshot table), `frequency-deviation`, `wiki-synthesis`.

### 5. OpenSpec capability `llm-wiki-content`

New main spec (sync on archive) covering policy document, drift callouts, and tone rules. No app runtime API changes in Phase 0.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Clone without `raw/` breaks ingest | Document in POLICY; skills assume local raw |
| Tier B numbers still cited in chat | Callouts + POLICY expected-value table |
| `preseededArticles` tone drift | Phase 1 replaces; POLICY states deprecation |
| Wiki latest round vs app cache drift | Phase 0.5 refresh from `data/lotto-draws.json` |

## Migration Plan

1. Phase 0 (done): policy, callouts, gitignore, wiki commit.
2. Archive change → sync `openspec/specs/llm-wiki-content/spec.md`.
3. Phase 0.5: regenerate Tier A analyses from app cache.
4. Phase 1: WikiTab reads `wiki/index.md`.

## Open Questions

- None for Phase 0. Phase 1 Reader routing for `[[wikilink]]` TBD in separate change.
