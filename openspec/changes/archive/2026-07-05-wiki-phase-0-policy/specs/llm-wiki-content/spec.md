## ADDED Requirements

### Requirement: Wiki policy document

The repository SHALL include `llm-wiki-lotto/wiki/POLICY.md` documenting Tier A (bonus-inclusive) and Tier B (main-six-only) statistics rules, canonical data alignment with `data/lotto-draws.json`, wiki tone guidelines, and git scope (wiki + AGENTS.md only).

#### Scenario: Policy page lists Tier A metrics

- **WHEN** a reader opens `llm-wiki-lotto/wiki/POLICY.md`
- **THEN** Tier A includes frequency, absence, zone, and co-occurrence with bonus-inclusive labeling

#### Scenario: Policy page lists git scope

- **WHEN** a reader opens the policy document
- **THEN** it states that `raw/`, `scripts/`, `.cursor/`, and `.obsidian/` are excluded from version control

### Requirement: Legacy Tier B drift callouts

Wiki pages with main-six-only statistics created before Phase 0 SHALL include a visible drift callout referencing [[POLICY]] and noting Tier A recomputation is planned.

#### Scenario: Frequency snapshot has drift callout

- **WHEN** a reader opens `analyses/frequency-snapshot-2026-07-05.md`
- **THEN** a callout at the top states the page uses Tier B legacy metrics

### Requirement: Wiki tone alignment

The wiki policy SHALL require honest probability framing (no trained-ML win claims) and alignment with LottoZavis Predictor as weighted-random statistical recommendation.

#### Scenario: Policy prohibits ML win claims

- **WHEN** a reader reviews wiki tone rules in POLICY.md
- **THEN** the document prohibits presenting LSTM/RF training or F1/confidence as factual win improvement
