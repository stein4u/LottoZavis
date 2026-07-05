## ADDED Requirements

### Requirement: Bonus-inclusive co-occurrence pairs

The system SHALL compute co-occurrence counts for unordered number pairs where both numbers appeared in the same draw among the six main numbers and the bonus number (21 pairs per draw). Results SHALL be labeled with `coOccurrenceIncludesBonus: true`.

#### Scenario: Pair counted when both in same draw main and bonus

- **WHEN** a draw has main `[3, 12, 19, 27, 33, 41]` and bonus `7`
- **THEN** the pair `(3, 7)` increments its co-occurrence count by one for that draw

#### Scenario: Window affects pair counts

- **WHEN** a client requests statistics with `window=100`
- **THEN** co-occurrence pairs are computed only over the most recent 100 draws in the cache

### Requirement: Top co-occurrence pairs on stats response

`GET /api/lotto-stats` SHALL include `topPairs`: the 20 highest-count bonus-inclusive pairs for the active window, each with `a`, `b`, `count`, and `rate` where `rate` is `count / drawCount` rounded to one decimal place in percentage or equivalent ratio field documented in API types.

#### Scenario: Top pairs ordered by count

- **WHEN** a client requests `GET /api/lotto-stats?window=all`
- **THEN** `topPairs` contains at most 20 entries sorted by `count` descending

#### Scenario: Policy field present

- **WHEN** a client receives a successful stats response with `topPairs`
- **THEN** the response includes `coOccurrenceIncludesBonus: true`

### Requirement: Per-number profile endpoint

The system SHALL expose `GET /api/lotto-stats/number/:n` with optional `window` query (`all`, `50`, `100`, `200`) returning bonus-inclusive frequency, absence, zone, and the top 10 co-occurring partner numbers for `:n`.

#### Scenario: Valid number profile

- **WHEN** a client requests `GET /api/lotto-stats/number/23?window=100`
- **THEN** the response includes `number: 23`, `count`, `drawsSince`, `zone`, `topPartners` (at most 10), `window`, `drawCount`, and `latestRound`

#### Scenario: Invalid number

- **WHEN** a client requests `GET /api/lotto-stats/number/0` or `46`
- **THEN** the system returns HTTP 400 with a clear error message

#### Scenario: Empty cache

- **WHEN** draw cache is empty and a client calls the number profile endpoint
- **THEN** the system returns HTTP 503 with a clear error message

#### Scenario: Partners sorted by co-occurrence count

- **WHEN** number 23 has co-occurred most often with numbers 7 and 41 in the selected window
- **THEN** `topPartners` lists those partners ahead of lower-count partners
