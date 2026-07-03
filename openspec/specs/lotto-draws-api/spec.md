# lotto-draws-api Specification

## Purpose
TBD - created by archiving change real-lotto-data-analysis. Update Purpose after archive.
## Requirements
### Requirement: Paginated draw history endpoint

The system SHALL expose `GET /api/draws` returning normalized draw records from the cache with pagination and optional range filtering.

#### Scenario: Default latest-first listing

- **WHEN** a client requests `GET /api/draws` without query parameters
- **THEN** the system returns up to 20 draws ordered by round descending

#### Scenario: Range filter

- **WHEN** a client requests `GET /api/draws?from=1200&to=1209`
- **THEN** the system returns draws whose round is between 1200 and 1209 inclusive, ordered by round descending

#### Scenario: Limit cap

- **WHEN** a client requests `GET /api/draws?limit=100`
- **THEN** the system returns at most 100 draws

#### Scenario: Draw record shape

- **WHEN** a draw is returned in the list
- **THEN** each record includes `round`, `date`, `numbers` (six sorted integers), `bonus`, `sum` (main-six sum), and `oddCount` (odd count among main six)

### Requirement: Latest draw endpoint

The system SHALL expose `GET /api/draws/latest` returning the single most recent draw from the cache.

#### Scenario: Latest draw response

- **WHEN** a client requests `GET /api/draws/latest`
- **THEN** the system returns one draw object with the highest round number in the cache

#### Scenario: Empty cache

- **WHEN** a client requests `GET /api/draws/latest` and no draws are cached
- **THEN** the system returns HTTP 503 with a clear error message indicating data is not yet loaded

### Requirement: Draw search by round

The system SHALL support retrieving a specific round via `GET /api/draws?from={n}&to={n}&limit=1`.

#### Scenario: Single round lookup

- **WHEN** a client requests `GET /api/draws?from=1100&to=1100`
- **THEN** the system returns exactly one draw for round 1100 if it exists in the cache

#### Scenario: Round not found

- **WHEN** a client requests a round not present in the cache
- **THEN** the system returns an empty `draws` array with `total: 0`

