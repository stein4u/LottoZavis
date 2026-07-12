## MODIFIED Requirements

### Requirement: Predict endpoint uses real draw statistics

The system SHALL generate recommended lotto numbers via `POST /api/predict` using weights derived from cached draw data and `statsEngine` frequencies, not hardcoded hot/cold lists. Prediction weights SHALL always use bonus-inclusive frequencies.

#### Scenario: Hot bias uses top frequency numbers

- **WHEN** a client requests prediction with `hotColdBias: "hot_heavy"` and `window: "all"`
- **THEN** numbers with higher bonus-inclusive frequency counts receive higher selection weight than numbers with lower counts

#### Scenario: Cold bias uses bottom frequency numbers

- **WHEN** a client requests prediction with `hotColdBias: "cold_heavy"`
- **THEN** numbers with lower bonus-inclusive frequency counts receive higher selection weight

#### Scenario: Window parameter affects weights

- **WHEN** a client requests prediction with `window: 90`
- **THEN** hot/cold weights are computed from the same 90-draw window used by `GET /api/lotto-stats?window=90` under bonus-inclusive frequency

#### Scenario: Empty cache

- **WHEN** draw cache is empty and a client calls `POST /api/predict`
- **THEN** the system returns HTTP 503 with a clear error message

### Requirement: Predictor tab honest UX

The Predictor tab SHALL present the feature as a statistical weighted recommendation based on real 동행복권 data, not as a neural network or ML prediction system with accuracy scores.

#### Scenario: No ML accuracy display

- **WHEN** a user views prediction results
- **THEN** the UI does not display precision, recall, F1, or percentage confidence scores

#### Scenario: Stats window selector

- **WHEN** a user generates a recommendation
- **THEN** the user can choose the same stats window options as Analysis (전체 / 30 / 60 / 90 / 120 / 150) and the selection is sent to the predict API

#### Scenario: Loading copy reflects statistics not ML training

- **WHEN** a recommendation is being generated
- **THEN** loading steps describe loading draw statistics and applying weight filters, not backpropagation or model training

#### Scenario: No client-side fake fallback

- **WHEN** the predict API request fails
- **THEN** the UI shows an error with retry and does not generate a random fallback result with fabricated metrics
