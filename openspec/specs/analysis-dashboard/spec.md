# analysis-dashboard Specification

## Purpose
TBD - created by archiving change real-lotto-data-analysis. Update Purpose after archive.
## Requirements
### Requirement: Analysis tab displays real data provenance

The Analysis tab SHALL fetch statistics from `GET /api/lotto-stats` and display data source, latest round, and last-updated metadata. It SHALL NOT use simulated fallback statistics when the API succeeds.

#### Scenario: Successful stats load

- **WHEN** the Analysis tab mounts and the stats API returns successfully
- **THEN** the header shows the actual `drawCount` and `latestRound` from the response

#### Scenario: Frequency label follows bonus policy

- **WHEN** frequency charts are rendered and `frequencyIncludesBonus` is true
- **THEN** the UI indicates that frequencies include the bonus number

- **WHEN** frequency charts are rendered and `frequencyIncludesBonus` is false
- **THEN** the UI indicates that frequencies exclude the bonus number (main six only)

#### Scenario: API failure handling

- **WHEN** the stats API request fails
- **THEN** the UI shows an error state with a retry action instead of silently showing fabricated data

### Requirement: Window filter controls

The Analysis tab SHALL provide controls to switch the statistics window among all draws and recent 30, 60, 90, 120, and 150 draws, re-fetching stats when the selection changes.

#### Scenario: User selects recent 90 draws

- **WHEN** the user selects the "90회" window filter
- **THEN** the tab requests `GET /api/lotto-stats` with `window=90` (and the active `includeBonus` value) and updates all windowed stat visualizations including the 45-number frequency chart

#### Scenario: Active filter indication

- **WHEN** a window filter is selected
- **THEN** the active filter is visually highlighted and reflected in displayed `drawCount`

### Requirement: Bonus include toggle on Analysis

The Analysis tab SHALL provide a control to choose whether frequency-family stats include the bonus number. The default SHALL be include (bonus-inclusive). Changing the toggle SHALL re-fetch `GET /api/lotto-stats` with `includeBonus=true|false` while keeping the current window. Co-occurrence UI SHALL remain labeled as bonus-inclusive and SHALL NOT claim to follow the toggle.

#### Scenario: Default includes bonus

- **WHEN** the Analysis tab loads
- **THEN** the bonus control defaults to include and the first stats request uses `includeBonus=true` or omits the parameter

#### Scenario: User selects exclude bonus

- **WHEN** the user selects 미포함 (exclude bonus)
- **THEN** the tab requests stats with `includeBonus=false` and updates frequency, Hot/Cold, absence, and zone displays accordingly

### Requirement: Latest draw banner

The Analysis tab SHALL fetch and display the latest draw via `GET /api/draws/latest`, showing round, date, six main numbers, bonus, sum, and odd/even breakdown. Main and bonus numbers SHALL be rendered with the shared decade-colored lotto-ball styling used elsewhere on Analysis. Balls on the banner SHALL be display-only (not open number drill-down).

#### Scenario: Latest draw displayed on load

- **WHEN** the Analysis tab loads successfully
- **THEN** a banner shows the most recent winning numbers and bonus from the latest-draw API

#### Scenario: Banner uses lotto ball styling

- **WHEN** the latest-draw banner is visible
- **THEN** each main number and the bonus appear as decade-colored lotto balls consistent with Analysis ball styling

### Requirement: Absence and zone insight cards

The Analysis tab SHALL display Phase 2 insight cards using `absence` and `zoneStats` from the stats API.

#### Scenario: Top absence numbers shown

- **WHEN** stats include `absence` data
- **THEN** the UI shows the six numbers with the highest `drawsSince` values and labels each with its absence count

#### Scenario: Zone distribution shown

- **WHEN** stats include `zoneStats`
- **THEN** the UI shows the three zones (1–15, 16–30, 31–45) with counts or percentages

### Requirement: Draw history table with search

The Analysis tab SHALL include a table of recent draws from `GET /api/draws` with columns for round, date, numbers, bonus, sum, and odd/even count, plus round search and pagination or "load more". Main and bonus numbers in each row SHALL use the shared decade-colored lotto-ball styling and SHALL be display-only. Initial load and each "더 보기" request SHALL fetch **30** draws per page (except single-round search).

#### Scenario: Initial table load

- **WHEN** the Analysis tab loads the draw history section
- **THEN** the table shows the most recent draws in descending round order and requests `limit=30`

#### Scenario: Round search

- **WHEN** the user enters a round number and submits search
- **THEN** the table requests draws filtered to that round and displays the result

#### Scenario: Load more draws

- **WHEN** the user clicks "더 보기" or equivalent pagination control
- **THEN** the table loads the next 30 older draws without losing the current view state

#### Scenario: History numbers use lotto balls

- **WHEN** a draw row is rendered in the history table
- **THEN** the six main numbers and bonus are shown as decade-colored lotto balls (not plain comma-separated text)

### Requirement: Predictor disclaimer while simulation remains

The Analysis tab or site footer SHALL include text clarifying that both Analysis and Predictor use real 동행복권 draw statistics, that co-occurrence and frequency patterns are exploratory only, and that recommendations do not guarantee winning outcomes.

#### Scenario: Disclaimer reflects real-data Predictor

- **WHEN** a user views the Analysis tab disclaimer or footer product description
- **THEN** Predictor is not described as a simulation disconnected from real data

#### Scenario: Co-occurrence not predictive

- **WHEN** a user reads the Analysis disclaimer after this change
- **THEN** the text clarifies that co-occurrence patterns are historical reference only

### Requirement: Co-occurrence insight card

The Analysis tab SHALL display a co-occurrence section using `topPairs` from the stats API, showing the top pairs with counts and rates for the active window filter, and a visible label that pairs include the bonus number.

#### Scenario: Top pairs update with window

- **WHEN** the user switches the stats window from "전체" to "100회"
- **THEN** the co-occurrence section refreshes with pairs computed for that window

#### Scenario: Bonus-inclusive label

- **WHEN** the co-occurrence section is visible
- **THEN** the UI states that co-occurrence includes main numbers and bonus in the same draw

### Requirement: Number drill-down slide panel

The Analysis tab SHALL open a right-side slide panel when the user selects a number from the frequency bar chart, Hot/Cold lists, or absence list. The panel SHALL fetch the number profile and recent draw appearances for the active window.

#### Scenario: Frequency bar opens panel

- **WHEN** the user clicks a bar in the 45-number frequency chart
- **THEN** a right slide panel opens for that number showing profile stats and top partners

#### Scenario: Hot Cold or absence opens panel

- **WHEN** the user clicks a number in the Hot Top 6, Cold Bottom 6, or absence list
- **THEN** the same slide panel opens for that number

#### Scenario: Panel shows recent appearances

- **WHEN** the slide panel is open for a number
- **THEN** the panel lists up to 10 recent draws where that number appeared, using the draws API with `contains`

#### Scenario: Panel dismiss

- **WHEN** the user closes the panel or clicks the backdrop
- **THEN** the panel closes without navigating away from Analysis

### Requirement: Client-side CSV export buttons

The Analysis tab SHALL provide at least two export actions that download CSV files generated client-side from currently displayed data without requiring new server export endpoints.

#### Scenario: Stats CSV export

- **WHEN** the user clicks the stats export control
- **THEN** a CSV file downloads containing frequencies, absence, zone stats, and top co-occurrence pairs for the active window

#### Scenario: Draw history CSV export

- **WHEN** the user clicks the draw table export control
- **THEN** a CSV file downloads containing the draw rows currently loaded in the table

### Requirement: Co-occurrence disclaimer

The Analysis tab SHALL include brief text near co-occurrence and drill-down features clarifying that historical pair frequency does not predict future draws.

#### Scenario: Disclaimer visible with co-occurrence

- **WHEN** a user views the co-occurrence section or an open drill-down panel
- **THEN** explanatory text states that co-occurrence is for exploration only and does not guarantee winning outcomes

### Requirement: Frequency-bucket ball stack chart

The Analysis tab SHALL display a frequency-bucket visualization derived from the currently loaded `frequencies` array. The X-axis SHALL represent appearance-count buckets; each bucket SHALL stack the lotto numbers that fall in that bucket as circular lotto-style balls. The chart SHALL update whenever the dashboard window or bonus-include selection changes the loaded stats.

#### Scenario: Chart uses active stats frequencies

- **WHEN** the Analysis tab has successfully loaded stats for the active window and `includeBonus` setting
- **THEN** the frequency-bucket chart is built only from that response's `frequencies` values

#### Scenario: Per-count buckets for short windows

- **WHEN** the active stats window is `30`, `60`, or `90`
- **THEN** each distinct appearance count is its own bucket and numbers with that exact count appear in that bucket

#### Scenario: Bin-5 buckets for wide windows

- **WHEN** the active stats window is `120`, `150`, or `all`
- **THEN** numbers are grouped into contiguous appearance-count bins of size 5

#### Scenario: Bonus policy label

- **WHEN** the frequency-bucket chart is shown
- **THEN** the section indicates whether frequencies include or exclude the bonus consistently with `frequencyIncludesBonus`

### Requirement: Lotto ball styling by number decade

Balls in the frequency-bucket chart SHALL use circular lotto-ball styling with decade colors: 1–10 yellow, 11–20 blue, 21–30 red, 31–40 gray, 41–45 green, and SHALL show the number on the ball.

#### Scenario: Decade color applied

- **WHEN** number 23 is rendered in a bucket
- **THEN** its ball uses the red decade style (21–30)

#### Scenario: Ball click opens drill-down

- **WHEN** the user clicks a numbered ball in the frequency-bucket chart
- **THEN** the existing number drill-down panel opens for that number

