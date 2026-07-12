## MODIFIED Requirements

### Requirement: Bonus-inclusive frequency counting

The system SHALL support frequency counting with or without the bonus number via the `includeBonus` query parameter on `GET /api/lotto-stats` (default `true`). When `includeBonus` is true or omitted, each draw increments frequency for the six main numbers and the bonus. When `includeBonus` is false, each draw increments frequency for the six main numbers only. The response SHALL set `frequencyIncludesBonus` to match the effective policy.

#### Scenario: Frequency tally per draw with bonus

- **WHEN** a draw with main numbers `[3, 12, 19, 27, 33, 41]` and bonus `7` is aggregated with `includeBonus=true`
- **THEN** each of those seven numbers increases its frequency count by exactly one

#### Scenario: Frequency tally per draw without bonus

- **WHEN** the same draw is aggregated with `includeBonus=false`
- **THEN** only the six main numbers increase frequency by one and bonus `7` is not counted for that draw

#### Scenario: Response discloses bonus policy

- **WHEN** a client requests `GET /api/lotto-stats` without `includeBonus`
- **THEN** the response includes `frequencyIncludesBonus: true`

- **WHEN** a client requests `GET /api/lotto-stats?includeBonus=false`
- **THEN** the response includes `frequencyIncludesBonus: false`

### Requirement: Windowed statistics

The system SHALL support aggregating statistics over a configurable subset of recent draws via the `window` query parameter on `GET /api/lotto-stats`.

#### Scenario: All draws (default)

- **WHEN** a client requests `GET /api/lotto-stats` without a window parameter
- **THEN** statistics are computed over all cached draws and `window` is `"all"`

#### Scenario: Recent N draws

- **WHEN** a client requests `GET /api/lotto-stats?window=90`
- **THEN** statistics are computed over the most recent 90 draws and `drawCount` is 90 (or fewer if cache has fewer draws)

#### Scenario: Supported window values

- **WHEN** a client passes `window` as `30`, `60`, `90`, `120`, or `150`
- **THEN** the system computes stats for that many most-recent draws

- **WHEN** a client passes an unsupported window such as `50` or `100`
- **THEN** the system returns HTTP 400

### Requirement: Phase 2 absence and zone metrics

The system SHALL include `absence` (draws since last appearance) and `zoneStats` (1–15, 16–30, 31–45 distribution) in the stats response. Appearance for these metrics SHALL follow the same `includeBonus` policy as frequency.

#### Scenario: Absence for a number that appeared in the latest draw

- **WHEN** a number appeared in the most recent aggregated draw under the active `includeBonus` policy
- **THEN** its `drawsSince` value is `0`

#### Scenario: Zone stats sum to total appearances with bonus

- **WHEN** zone statistics are computed for a window with `includeBonus=true`
- **THEN** the sum of zone `count` values equals total frequency tally events (draws × 7) in that window

#### Scenario: Zone stats sum to total appearances without bonus

- **WHEN** zone statistics are computed for a window with `includeBonus=false`
- **THEN** the sum of zone `count` values equals total frequency tally events (draws × 6) in that window

### Requirement: Per-number profile endpoint

The system SHALL expose `GET /api/lotto-stats/number/:n` with optional `window` query (`all`, `30`, `60`, `90`, `120`, `150`) and optional `includeBonus` (default true) returning frequency `count`, absence, and zone for `:n` under that policy. Top co-occurring partners SHALL remain bonus-inclusive regardless of `includeBonus`.

#### Scenario: Valid number profile

- **WHEN** a client requests `GET /api/lotto-stats/number/23?window=90`
- **THEN** the response includes `number: 23`, `count`, `drawsSince`, `zone`, `topPartners` (at most 10), `window`, `drawCount`, and `latestRound`

#### Scenario: Profile respects includeBonus

- **WHEN** a client requests `GET /api/lotto-stats/number/23?window=90&includeBonus=false`
- **THEN** `count`, `drawsSince`, and `zone` reflect main-six-only aggregation over the last 90 draws, while `topPartners` remain bonus-inclusive

#### Scenario: Invalid number

- **WHEN** a client requests `GET /api/lotto-stats/number/0` or `46`
- **THEN** the system returns HTTP 400 with a clear error message

#### Scenario: Empty cache

- **WHEN** draw cache is empty and a client calls the number profile endpoint
- **THEN** the system returns HTTP 503 with a clear error message

#### Scenario: Partners sorted by co-occurrence count

- **WHEN** number 23 has co-occurred most often with numbers 7 and 41 in the selected window
- **THEN** `topPartners` lists those partners ahead of lower-count partners

## ADDED Requirements

### Requirement: includeBonus does not alter co-occurrence

Co-occurrence pair counts and `topPairs` SHALL always be computed bonus-inclusive (main six + bonus, 21 pairs per draw) regardless of the `includeBonus` query parameter. The response SHALL continue to set `coOccurrenceIncludesBonus: true`.

#### Scenario: Pairs ignore includeBonus=false

- **WHEN** a client requests `GET /api/lotto-stats?includeBonus=false`
- **THEN** `topPairs` match the bonus-inclusive pair counts for the same window and `coOccurrenceIncludesBonus` is `true`
