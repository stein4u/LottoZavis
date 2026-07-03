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

The system SHALL increment the frequency count for each of the six main numbers and the bonus number on every draw. Frequency totals SHALL be labeled as bonus-inclusive in the API response (`frequencyIncludesBonus: true`).

#### Scenario: Frequency tally per draw

- **WHEN** a draw with main numbers `[3, 12, 19, 27, 33, 41]` and bonus `7` is aggregated
- **THEN** each of those seven numbers increases its frequency count by exactly one

#### Scenario: UI disclosure of bonus policy

- **WHEN** a client receives `GET /api/lotto-stats`
- **THEN** the response includes `frequencyIncludesBonus: true`

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

- **WHEN** a client requests `GET /api/lotto-stats?window=100`
- **THEN** statistics are computed over the most recent 100 draws and `drawCount` is 100 (or fewer if cache has fewer draws)

#### Scenario: Supported window values

- **WHEN** a client passes `window` as `50`, `100`, or `200`
- **THEN** the system computes stats for that many most-recent draws

### Requirement: Phase 2 absence and zone metrics

The system SHALL include `absence` (draws since last appearance, bonus-inclusive) and `zoneStats` (1–15, 16–30, 31–45 distribution, bonus-inclusive) in the stats response.

#### Scenario: Absence for a number that appeared in the latest draw

- **WHEN** a number appeared in the most recent aggregated draw (main or bonus)
- **THEN** its `drawsSince` value is `0`

#### Scenario: Zone stats sum to total appearances

- **WHEN** zone statistics are computed for a window
- **THEN** the sum of zone `count` values equals total frequency tally events (draws × 7) in that window

### Requirement: Stats API metadata

`GET /api/lotto-stats` SHALL return `lastUpdated`, `dataSource: "dhlottery"`, `latestRound`, and `window` alongside existing chart fields (`frequencies`, `oddEvenRatio`, `consecutivePairsCount`, `sumRangeStats`).

#### Scenario: Response includes provenance fields

- **WHEN** a client requests statistics successfully
- **THEN** the response includes `lastUpdated`, `dataSource`, `latestRound`, and `window`

