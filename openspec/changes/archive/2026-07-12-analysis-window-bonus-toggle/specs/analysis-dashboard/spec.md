## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Bonus include toggle on Analysis

The Analysis tab SHALL provide a control to choose whether frequency-family stats include the bonus number. The default SHALL be include (bonus-inclusive). Changing the toggle SHALL re-fetch `GET /api/lotto-stats` with `includeBonus=true|false` while keeping the current window. Co-occurrence UI SHALL remain labeled as bonus-inclusive and SHALL NOT claim to follow the toggle.

#### Scenario: Default includes bonus

- **WHEN** the Analysis tab loads
- **THEN** the bonus control defaults to include and the first stats request uses `includeBonus=true` or omits the parameter

#### Scenario: User selects exclude bonus

- **WHEN** the user selects 미포함 (exclude bonus)
- **THEN** the tab requests stats with `includeBonus=false` and updates frequency, Hot/Cold, absence, and zone displays accordingly
