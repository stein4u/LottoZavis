## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Predictor disclaimer while simulation remains

The Analysis tab or site footer SHALL include text clarifying that both Analysis and Predictor use real 동행복권 draw statistics, that co-occurrence and frequency patterns are exploratory only, and that recommendations do not guarantee winning outcomes.

#### Scenario: Disclaimer reflects real-data Predictor

- **WHEN** a user views the Analysis tab disclaimer or footer product description
- **THEN** Predictor is not described as a simulation disconnected from real data

#### Scenario: Co-occurrence not predictive

- **WHEN** a user reads the Analysis disclaimer after this change
- **THEN** the text clarifies that co-occurrence patterns are historical reference only
