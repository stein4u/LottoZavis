# lotto-data-ingest Specification

## Purpose
TBD - created by archiving change real-lotto-data-analysis. Update Purpose after archive.
## Requirements
### Requirement: System loads draw history from 동행복권

The system SHALL fetch Korean Lotto (6/45) draw results from the 동행복권 JSON API and normalize each record into a consistent internal shape: round number, draw date, six main numbers (sorted ascending), and one bonus number.

#### Scenario: Successful fetch of a known round

- **WHEN** the ingest module requests a valid past round number from 동행복권
- **THEN** the system returns a normalized draw with six numbers in range 1–45, a bonus in range 1–45, and a parseable draw date

#### Scenario: Required HTTP headers for API access

- **WHEN** the ingest module calls the 동행복권 JSON endpoint
- **THEN** the request SHALL include `X-Requested-With: XMLHttpRequest` and an appropriate `Referer` header as required by the upstream API

### Requirement: Draw data is cached on the server filesystem

The system SHALL persist normalized draws to a local cache file (`data/lotto-draws.json`) so that statistics and API responses do not re-fetch the full history on every request.

#### Scenario: Cache hit on server restart

- **WHEN** the server starts and a valid cache file exists
- **THEN** the system loads draws from the cache without performing a full bulk fetch

#### Scenario: Cache metadata

- **WHEN** the cache is written or updated
- **THEN** the cache SHALL record `latestRound` and `lastUpdated` (ISO 8601 timestamp)

### Requirement: Incremental refresh of new draws

The system SHALL support updating the cache from the last stored round through the latest available round without re-fetching all historical rounds.

#### Scenario: New round available after weekly draw

- **WHEN** a refresh is triggered and the upstream latest round is greater than the cached `latestRound`
- **THEN** the system fetches only missing rounds and appends them to the cache

#### Scenario: No new rounds

- **WHEN** a refresh is triggered and the cached `latestRound` equals the upstream latest round
- **THEN** the system updates `lastUpdated` without duplicating draw records

### Requirement: Manual refresh endpoint for development

The system SHALL expose `POST /api/admin/refresh` that triggers incremental ingest and returns the number of newly added draws and the current `latestRound`.

#### Scenario: Successful manual refresh

- **WHEN** a client sends `POST /api/admin/refresh`
- **THEN** the system returns JSON including `success: true`, `addedCount`, and `latestRound`

