## ADDED Requirements

### Requirement: Filter draws by contained number

The system SHALL support optional `contains` query parameter on `GET /api/draws` where `contains` is an integer 1–45. When provided, only draws where the number appears among the six main numbers or as the bonus SHALL be included before pagination and range filters apply.

#### Scenario: Filter by main number

- **WHEN** a client requests `GET /api/draws?contains=23&limit=10`
- **THEN** returned draws each include 23 in `numbers` or as `bonus`

#### Scenario: Combined with round range

- **WHEN** a client requests `GET /api/draws?contains=7&from=1100&to=1200`
- **THEN** results are limited to draws in rounds 1100–1200 where 7 appeared

#### Scenario: Invalid contains value

- **WHEN** a client requests `GET /api/draws?contains=0` or `contains=99`
- **THEN** the system returns HTTP 400 with a clear error message

#### Scenario: No matching draws

- **WHEN** no cached draw contains the requested number in the filtered set
- **THEN** the system returns `draws: []` and `total: 0`
