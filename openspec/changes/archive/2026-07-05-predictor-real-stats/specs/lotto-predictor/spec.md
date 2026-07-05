## ADDED Requirements

### Requirement: Predict endpoint uses real draw statistics

The system SHALL generate recommended lotto numbers via `POST /api/predict` using weights derived from cached draw data and `statsEngine` frequencies, not hardcoded hot/cold lists.

#### Scenario: Hot bias uses top frequency numbers

- **WHEN** a client requests prediction with `hotColdBias: "hot_heavy"` and `window: "all"`
- **THEN** numbers with higher bonus-inclusive frequency counts receive higher selection weight than numbers with lower counts

#### Scenario: Cold bias uses bottom frequency numbers

- **WHEN** a client requests prediction with `hotColdBias: "cold_heavy"`
- **THEN** numbers with lower bonus-inclusive frequency counts receive higher selection weight

#### Scenario: Window parameter affects weights

- **WHEN** a client requests prediction with `window: 100`
- **THEN** hot/cold weights are computed from the same 100-draw window used by `GET /api/lotto-stats?window=100`

#### Scenario: Empty cache

- **WHEN** draw cache is empty and a client calls `POST /api/predict`
- **THEN** the system returns HTTP 503 with a clear error message

### Requirement: No fabricated ML evaluation metrics

The predict API SHALL NOT return simulated confidence scores or ML evaluation metrics (precision, recall, F1). The response SHALL include transparent metadata describing the recommendation method and stats context.

#### Scenario: Response metadata instead of fake metrics

- **WHEN** a prediction succeeds
- **THEN** the response includes `method: "weighted-random"`, `statsWindow`, and `latestRound`, and does not include `confidence` or `metrics` fields

#### Scenario: Six unique numbers returned

- **WHEN** a prediction succeeds
- **THEN** the response contains exactly six unique integers in range 1–45 sorted ascending, excluding any `excludeNumbers` provided by the client

### Requirement: Weight profiles instead of trained models

Model type selection (`random_forest`, `xgboost`, `lstm`) SHALL apply distinct weight-tuning profiles only. The system SHALL NOT claim that models were trained or evaluated on draw data.

#### Scenario: Profile affects weights without ML claims

- **WHEN** a client selects `modelType: "random_forest"` versus `modelType: "lstm"`
- **THEN** the generated weights may differ but both use the same underlying frequency statistics

### Requirement: Predictor tab honest UX

The Predictor tab SHALL present the feature as a statistical weighted recommendation based on real 동행복권 data, not as a neural network or ML prediction system with accuracy scores.

#### Scenario: No ML accuracy display

- **WHEN** a user views prediction results
- **THEN** the UI does not display precision, recall, F1, or percentage confidence scores

#### Scenario: Stats window selector

- **WHEN** a user generates a recommendation
- **THEN** the user can choose the same stats window options as Analysis (전체 / 50 / 100 / 200) and the selection is sent to the predict API

#### Scenario: Loading copy reflects statistics not ML training

- **WHEN** a recommendation is being generated
- **THEN** loading steps describe loading draw statistics and applying weight filters, not backpropagation or model training

#### Scenario: No client-side fake fallback

- **WHEN** the predict API request fails
- **THEN** the UI shows an error with retry and does not generate a random fallback result with fabricated metrics

### Requirement: Site disclaimers updated after alignment

Analysis tab and/or footer disclaimers SHALL state that Predictor uses the same real draw statistics as Analysis, while still clarifying that recommendations do not guarantee winning outcomes.

#### Scenario: Disclaimer no longer calls Predictor simulation

- **WHEN** a user reads the Analysis disclaimer or footer product description after this change
- **THEN** Predictor is not described as a simulation disconnected from real data

### Requirement: Saved predictions include stats context

When a logged-in user saves a recommendation to Firestore, the system SHALL store optional metadata: `statsWindow` and `latestRound` at generation time.

#### Scenario: Save includes stats metadata

- **WHEN** a user saves a generated recommendation
- **THEN** the stored record includes `statsWindow` and `latestRound` fields
