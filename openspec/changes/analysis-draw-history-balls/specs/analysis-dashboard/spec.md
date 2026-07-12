## MODIFIED Requirements

### Requirement: Latest draw banner

The Analysis tab SHALL fetch and display the latest draw via `GET /api/draws/latest`, showing round, date, six main numbers, bonus, sum, and odd/even breakdown. Main and bonus numbers SHALL be rendered with the shared decade-colored lotto-ball styling used elsewhere on Analysis. Balls on the banner SHALL be display-only (not open number drill-down).

#### Scenario: Latest draw displayed on load

- **WHEN** the Analysis tab loads successfully
- **THEN** a banner shows the most recent winning numbers and bonus from the latest-draw API

#### Scenario: Banner uses lotto ball styling

- **WHEN** the latest-draw banner is visible
- **THEN** each main number and the bonus appear as decade-colored lotto balls consistent with Analysis ball styling

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
