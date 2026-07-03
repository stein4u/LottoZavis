# analysis-dashboard Specification

## Purpose
TBD - created by archiving change real-lotto-data-analysis. Update Purpose after archive.
## Requirements
### Requirement: Analysis tab displays real data provenance

The Analysis tab SHALL fetch statistics from `GET /api/lotto-stats` and display data source, latest round, and last-updated metadata. It SHALL NOT use simulated fallback statistics when the API succeeds.

#### Scenario: Successful stats load

- **WHEN** the Analysis tab mounts and the stats API returns successfully
- **THEN** the header shows the actual `drawCount` and `latestRound` from the response

#### Scenario: Bonus-inclusive frequency label

- **WHEN** frequency charts are rendered
- **THEN** the UI indicates that frequencies include the bonus number

#### Scenario: API failure handling

- **WHEN** the stats API request fails
- **THEN** the UI shows an error state with a retry action instead of silently showing fabricated data

### Requirement: Window filter controls

The Analysis tab SHALL provide controls to switch the statistics window among all draws, recent 50, 100, and 200 draws, re-fetching stats when the selection changes.

#### Scenario: User selects recent 100 draws

- **WHEN** the user selects the "100회" window filter
- **THEN** the tab requests `GET /api/lotto-stats?window=100` and updates all stat visualizations

#### Scenario: Active filter indication

- **WHEN** a window filter is selected
- **THEN** the active filter is visually highlighted and reflected in displayed `drawCount`

### Requirement: Latest draw banner

The Analysis tab SHALL fetch and display the latest draw via `GET /api/draws/latest`, showing round, date, six main numbers, bonus, sum, and odd/even breakdown.

#### Scenario: Latest draw displayed on load

- **WHEN** the Analysis tab loads successfully
- **THEN** a banner shows the most recent winning numbers and bonus from the latest-draw API

### Requirement: Absence and zone insight cards

The Analysis tab SHALL display Phase 2 insight cards using `absence` and `zoneStats` from the stats API.

#### Scenario: Top absence numbers shown

- **WHEN** stats include `absence` data
- **THEN** the UI shows the six numbers with the highest `drawsSince` values and labels each with its absence count

#### Scenario: Zone distribution shown

- **WHEN** stats include `zoneStats`
- **THEN** the UI shows the three zones (1–15, 16–30, 31–45) with counts or percentages

### Requirement: Draw history table with search

The Analysis tab SHALL include a table of recent draws from `GET /api/draws` with columns for round, date, numbers, bonus, sum, and odd/even count, plus round search and pagination or "load more".

#### Scenario: Initial table load

- **WHEN** the Analysis tab loads the draw history section
- **THEN** the table shows the most recent draws in descending round order

#### Scenario: Round search

- **WHEN** the user enters a round number and submits search
- **THEN** the table requests draws filtered to that round and displays the result

#### Scenario: Load more draws

- **WHEN** the user clicks "더 보기" or equivalent pagination control
- **THEN** the table loads the next page of older draws without losing the current view state

### Requirement: Predictor disclaimer while simulation remains

The Analysis tab or site footer SHALL include text clarifying that the Predictor tab's recommendation engine is still simulated and that the Analysis tab reflects real 동행복권 data.

#### Scenario: Disclaimer visible

- **WHEN** a user views the Analysis tab
- **THEN** a visible notice states that analysis uses real draw data and that number recommendation in Predictor is not yet data-driven

