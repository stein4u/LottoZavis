## 1. Wiki policy content

- [x] 1.1 Create `llm-wiki-lotto/wiki/POLICY.md` (Tier A/B, git scope, tone, app alignment)
- [x] 1.2 Add Tier B legacy drift callouts on frequency-snapshot, freq-trend, dhlottery-official-draws, frequency-deviation, wiki-synthesis
- [x] 1.3 Add `.gitignore` rules for `raw/`, `scripts/`, `.cursor/`, `.obsidian/` (root + nested)
- [x] 1.4 Git commit `AGENTS.md` and `wiki/**` only (commit `87edb8f`)
- [x] 1.5 Update `index.md`, `overview.md`, `log.md`, and `AGENTS.md` to reference POLICY

## 2. Verification

- [x] 2.1 Verify `POLICY.md` lists Tier A metrics and git exclusions
- [x] 2.2 Verify drift callouts present on all five legacy pages
- [x] 2.3 Verify `git check-ignore` rejects `llm-wiki-lotto/raw/` paths
- [x] 2.4 Run `openspec validate wiki-phase-0-policy`

## 3. Archive

- [x] 3.1 Sync delta spec to `openspec/specs/llm-wiki-content/spec.md`
- [x] 3.2 Run `/opsx:archive wiki-phase-0-policy`
