# lotto-predictor Specification

## Purpose
Statistical weighted-random recommendations from real 동행복권 draw statistics, coexisting with cached Random Forest and LSTM ML experiment paths in the Predictor tab.

## Requirements
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

### Requirement: No fabricated ML evaluation metrics

The predict API SHALL NOT return simulated confidence scores or ML evaluation metrics (precision, recall, F1). The response SHALL include transparent metadata describing the recommendation method and stats context.

#### Scenario: Response metadata instead of fake metrics

- **WHEN** a prediction succeeds
- **THEN** the response includes `method: "weighted-random"`, `statsWindow`, and `latestRound`, and does not include `confidence` or `metrics` fields

#### Scenario: Six unique numbers returned

- **WHEN** a prediction succeeds
- **THEN** the response contains exactly six unique integers in range 1–45 sorted ascending, excluding any `excludeNumbers` provided by the client

### Requirement: Weight profiles instead of trained models

Model type selection (`mid_range`, `freq_tilt`, `absence_tilt`) SHALL apply distinct weight-tuning profiles only for the statistical weighted-random path. The system SHALL NOT claim that these profiles were trained or evaluated as ML models on draw data. Legacy identifiers `random_forest`, `xgboost`, and `lstm` SHALL NOT be accepted as profile names for `POST /api/predict`.

#### Scenario: Profile affects weights without ML claims

- **WHEN** a client selects `modelType: "mid_range"` versus `modelType: "absence_tilt"`
- **THEN** the generated weights may differ but both use the same underlying frequency statistics and `method` remains `weighted-random`

#### Scenario: Legacy ML-named profiles rejected

- **WHEN** a client sends `modelType: "random_forest"` to `POST /api/predict`
- **THEN** the system rejects the request with a validation error directing clients to the renamed profiles

### Requirement: Predictor tab honest UX

The Predictor tab SHALL present the default statistical path as a weighted recommendation based on real 동행복권 data. Statistical results SHALL NOT display precision, recall, F1, or percentage confidence scores. When Random Forest or LSTM ML modes are selected, the UI MAY display real training metrics from the corresponding ML status APIs with an explicit experimental disclaimer, and SHALL NOT conflate those metrics with the statistical path.

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

#### Scenario: RF mode shows real metrics only

- **WHEN** a user views the Random Forest ML subsection with an available model
- **THEN** displayed R² and hit-count values come from `GET /api/ml/rf/status` (or the predict response snapshot), not invented client-side scores

#### Scenario: LSTM mode shows real metrics only

- **WHEN** a user views the LSTM ML subsection with an available model
- **THEN** displayed hit-count, val-loss/overfit, and prize/rank metrics come from `GET /api/ml/lstm/status` (or the predict response snapshot), not invented client-side scores

### Requirement: Site disclaimers updated after alignment

Analysis tab and/or footer disclaimers SHALL state that Predictor uses the same real draw statistics as Analysis, while still clarifying that recommendations do not guarantee winning outcomes.

#### Scenario: Disclaimer no longer calls Predictor simulation

- **WHEN** a user reads the Analysis disclaimer or footer product description after this change
- **THEN** Predictor is not described as a simulation disconnected from real data

### Requirement: Saved predictions include stats context

When a logged-in user saves a recommendation to Firestore, the system SHALL store metadata identifying the generation method (`weighted-random`, `random-forest-ml`, or `lstm-ml`). Statistical saves SHALL include `statsWindow` and `latestRound` at generation time. ML saves (RF or LSTM) SHALL include `latestRound` and MAY include method-specific metric snapshot fields without using a fabricated `confidence` percentage.

#### Scenario: Save includes stats metadata

- **WHEN** a user saves a statistical weighted-random recommendation
- **THEN** the stored record includes `statsWindow`, `latestRound`, and method metadata for `weighted-random`

#### Scenario: Save includes ML method metadata

- **WHEN** a user saves a Random Forest ML recommendation
- **THEN** the stored record includes `latestRound` and method metadata for `random-forest-ml`

#### Scenario: Save includes LSTM method metadata

- **WHEN** a user saves an LSTM ML recommendation
- **THEN** the stored record includes `latestRound` and method metadata for `lstm-ml`

### Requirement: Predictor offers statistical and ML modes

The Predictor tab SHALL allow the user to choose among statistical weighted-random recommendation (`POST /api/predict`), cached Random Forest ML (`POST /api/ml/rf/predict`), and cached LSTM ML (`POST /api/ml/lstm/predict`) without presenting statistical weight profiles as trained Random Forest / XGBoost / LSTM models.

#### Scenario: Three mode choices visible

- **WHEN** a user opens the Predictor tab
- **THEN** the UI exposes a clear choice among the statistical path, the Random Forest ML path, and the LSTM ML path
