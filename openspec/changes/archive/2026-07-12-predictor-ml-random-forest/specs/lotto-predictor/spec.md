## MODIFIED Requirements

### Requirement: Weight profiles instead of trained models

Model type selection (`mid_range`, `freq_tilt`, `absence_tilt`) SHALL apply distinct weight-tuning profiles only for the statistical weighted-random path. The system SHALL NOT claim that these profiles were trained or evaluated as ML models on draw data. Legacy identifiers `random_forest`, `xgboost`, and `lstm` SHALL NOT be accepted as profile names for `POST /api/predict`.

#### Scenario: Profile affects weights without ML claims

- **WHEN** a client selects `modelType: "mid_range"` versus `modelType: "absence_tilt"`
- **THEN** the generated weights may differ but both use the same underlying frequency statistics and `method` remains `weighted-random`

#### Scenario: Legacy ML-named profiles rejected

- **WHEN** a client sends `modelType: "random_forest"` to `POST /api/predict`
- **THEN** the system rejects the request with a validation error directing clients to the renamed profiles

### Requirement: Predictor tab honest UX

The Predictor tab SHALL present the default statistical path as a weighted recommendation based on real 동행복권 data. Statistical results SHALL NOT display precision, recall, F1, or percentage confidence scores. When the separate Random Forest ML mode is selected, the UI MAY display real training metrics (R², hit-count) from the ML status API with an explicit experimental disclaimer, and SHALL NOT conflate those metrics with the statistical path.

#### Scenario: No fabricated accuracy on statistical results

- **WHEN** a user views statistical weighted-random prediction results
- **THEN** the UI does not display precision, recall, F1, or percentage confidence scores

#### Scenario: Stats window selector

- **WHEN** a user generates a statistical recommendation
- **THEN** the user can choose the same stats window options as Analysis (전체 / 30 / 60 / 90 / 120 / 150) and the selection is sent to the predict API

#### Scenario: Loading copy reflects statistics not ML training

- **WHEN** a statistical recommendation is being generated
- **THEN** loading steps describe loading draw statistics and applying weight filters, not backpropagation or model training

#### Scenario: No client-side fake fallback

- **WHEN** the statistical predict API request fails
- **THEN** the UI shows an error with retry and does not generate a random fallback result with fabricated metrics

#### Scenario: ML mode shows real metrics only

- **WHEN** a user views the Random Forest ML subsection with an available model
- **THEN** displayed R² and hit-count values come from `GET /api/ml/rf/status` (or the predict response snapshot), not invented client-side scores

### Requirement: Saved predictions include stats context

When a logged-in user saves a recommendation to Firestore, the system SHALL store metadata identifying the generation method (`weighted-random` or `random-forest-ml`). Statistical saves SHALL include `statsWindow` and `latestRound` at generation time. ML saves SHALL include `latestRound` and MAY include metric snapshot fields (`r2`, `hitMean`) without using a fabricated `confidence` percentage.

#### Scenario: Save includes stats metadata

- **WHEN** a user saves a statistical weighted-random recommendation
- **THEN** the stored record includes `statsWindow`, `latestRound`, and method metadata for `weighted-random`

#### Scenario: Save includes ML method metadata

- **WHEN** a user saves a Random Forest ML recommendation
- **THEN** the stored record includes `latestRound` and method metadata for `random-forest-ml`

## ADDED Requirements

### Requirement: Predictor offers statistical and ML modes

The Predictor tab SHALL allow the user to choose between statistical weighted-random recommendation (`POST /api/predict`) and cached Random Forest ML recommendation (`POST /api/ml/rf/predict`) without presenting weight profiles as trained Random Forest / XGBoost / LSTM models.

#### Scenario: Mode toggle visible

- **WHEN** a user opens the Predictor tab
- **THEN** the UI exposes a clear choice between the statistical path and the Random Forest ML path
