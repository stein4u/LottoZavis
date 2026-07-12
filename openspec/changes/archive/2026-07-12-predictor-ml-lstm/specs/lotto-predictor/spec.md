## MODIFIED Requirements

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
