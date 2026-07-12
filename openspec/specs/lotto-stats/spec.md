# lotto-stats Specification

## Purpose
TBD - created by archiving change real-lotto-data-analysis. Update Purpose after archive.
## Requirements
### Requirement: Statistics are computed from cached draws

The system SHALL compute lotto statistics from the cached draw dataset rather than hardcoded or simulated values.

#### Scenario: Stats reflect actual draw count

- **WHEN** a client requests statistics with `window=all`
- **THEN** `drawCount` equals the number of draws included in the aggregation and `latestRound` matches the cache

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

### Requirement: Main-six metrics exclude bonus

Odd/even ratio, sum range distribution, and consecutive-pairs count SHALL be computed using only the six main winning numbers per draw.

#### Scenario: Odd/even ratio uses six numbers per draw

- **WHEN** statistics are computed for any window
- **THEN** each draw contributes exactly six odd/even classifications to `oddEvenRatio`, excluding the bonus number

#### Scenario: Sum range uses six-number sum

- **WHEN** sum range buckets are computed
- **THEN** each draw's sum is the sum of its six main numbers only

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

### Requirement: Stats API metadata

`GET /api/lotto-stats` SHALL return `lastUpdated`, `dataSource: "dhlottery"`, `latestRound`, and `window` alongside existing chart fields (`frequencies`, `oddEvenRatio`, `consecutivePairsCount`, `sumRangeStats`).

#### Scenario: Response includes provenance fields

- **WHEN** a client requests statistics successfully
- **THEN** the response includes `lastUpdated`, `dataSource`, `latestRound`, and `window`

### Requirement: Bonus-inclusive co-occurrence pairs

The system SHALL compute co-occurrence counts for unordered number pairs where both numbers appeared in the same draw among the six main numbers and the bonus number (21 pairs per draw). Results SHALL be labeled with `coOccurrenceIncludesBonus: true`.

#### Scenario: Pair counted when both in same draw main and bonus

- **WHEN** a draw has main `[3, 12, 19, 27, 33, 41]` and bonus `7`
- **THEN** the pair `(3, 7)` increments its co-occurrence count by one for that draw

#### Scenario: Window affects pair counts

- **WHEN** a client requests statistics with `window=90`
- **THEN** co-occurrence pairs are computed only over the most recent 90 draws in the cache

### Requirement: Top co-occurrence pairs on stats response

`GET /api/lotto-stats` SHALL include `topPairs`: the 20 highest-count bonus-inclusive pairs for the active window, each with `a`, `b`, `count`, and `rate` where `rate` is `count / drawCount` rounded to one decimal place in percentage or equivalent ratio field documented in API types.

#### Scenario: Top pairs ordered by count

- **WHEN** a client requests `GET /api/lotto-stats?window=all`
- **THEN** `topPairs` contains at most 20 entries sorted by `count` descending

#### Scenario: Policy field present

- **WHEN** a client receives a successful stats response with `topPairs`
- **THEN** the response includes `coOccurrenceIncludesBonus: true`

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

### Requirement: includeBonus does not alter co-occurrence

Co-occurrence pair counts and `topPairs` SHALL always be computed bonus-inclusive (main six + bonus, 21 pairs per draw) regardless of the `includeBonus` query parameter. The response SHALL continue to set `coOccurrenceIncludesBonus: true`.

#### Scenario: Pairs ignore includeBonus=false

- **WHEN** a client requests `GET /api/lotto-stats?includeBonus=false`
- **THEN** `topPairs` match the bonus-inclusive pair counts for the same window and `coOccurrenceIncludesBonus` is `true`

