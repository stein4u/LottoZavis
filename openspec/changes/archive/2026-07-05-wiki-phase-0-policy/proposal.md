## Why

`llm-wiki-lotto/` was added alongside LottoZavis but untracked, with statistics computed on main-six-only (Tier B) while the app uses bonus-inclusive Tier A metrics. Wiki tone (honest probability framing) also conflicts with hardcoded `preseededArticles` ML marketing copy. Phase 0 establishes shared policy, git scope, and drift labels before WikiTab Reader integration (Phase 1).

## What Changes

- Add `llm-wiki-lotto/wiki/POLICY.md` defining Tier A/B statistics, canonical data (`data/lotto-draws.json`), wiki tone, and git scope (wiki + `AGENTS.md` only).
- Add **Tier B legacy** drift callouts on affected analyses/sources/concepts pages.
- Update `wiki/index.md`, `overview.md`, `log.md`, and `AGENTS.md` to reference policy.
- Add `.gitignore` rules excluding `llm-wiki-lotto/raw/`, `scripts/`, `.cursor/`, `.obsidian/`.
- Initial git commit of `llm-wiki-lotto/AGENTS.md`, `llm-wiki-lotto/wiki/**`, and nested `.gitignore`.

**Non-goals (Phase 0):** WikiTab UI, RAG, Tier A number recomputation (Phase 0.5), raw/ ingest in repo.

## Capabilities

### New Capabilities

- `llm-wiki-content`: Structured markdown knowledge base under `llm-wiki-lotto/wiki/` with policy, concepts, sources, and analyses (Phase 0 = policy + versioned content only).

### Modified Capabilities

<!-- No app runtime spec changes in Phase 0; app specs unchanged until Phase 1 Reader -->

## Impact

- **Repository**: New tracked paths under `llm-wiki-lotto/wiki/`; `raw/` remains local-only.
- **Documentation**: Policy aligns wiki with `openspec/specs/lotto-stats` bonus-inclusive rules.
- **App**: No code changes in Phase 0; `WikiTab` / `preseededArticles` unchanged until Phase 1.
- **Follow-ups**: Phase 0.5 (Tier A analyses refresh), Phase 1 (Wiki Reader), Phase 2 (RAG).
