## ADDED Requirements

### Requirement: LSTM trains via manual npm script only

The system SHALL provide `npm run train:lstm` (or equivalent documented entry) that trains a sequence-window LSTM from `data/lotto-draws.json` using main-six numbers only (bonus excluded) and writes model and metrics artifacts under `data/ml/`. Draw ingest and incremental refresh SHALL NOT trigger LSTM training.

#### Scenario: Manual train writes cache

- **WHEN** an operator runs the LSTM train script successfully with draws available and TensorFlow installed
- **THEN** the system writes an LSTM model artifact and `lstm_metrics.json` (or equivalent) tagged with `latestRound` and `trainedAt`

#### Scenario: Refresh does not train LSTM

- **WHEN** `incrementalRefresh` or admin refresh completes
- **THEN** LSTM model files are not regenerated as part of that refresh path

### Requirement: Cached LSTM predict and status APIs

The system SHALL expose `GET /api/ml/lstm/status` and `POST /api/ml/lstm/predict`. Predict SHALL load the cached model only (no on-request training) and return six unique integers in 1–45 sorted ascending with `method: "lstm-ml"`.

#### Scenario: Status with trained model

- **WHEN** LSTM metrics and model exist
- **THEN** `GET /api/ml/lstm/status` returns `available: true` with metric fields for hit-count, validation loss/overfit summary, and prize/rank simulation

#### Scenario: Predict with warm cache

- **WHEN** a valid LSTM cache exists and a client calls `POST /api/ml/lstm/predict`
- **THEN** the response includes six sorted unique numbers and `method: "lstm-ml"`

#### Scenario: Predict with cold cache

- **WHEN** no LSTM model cache exists
- **THEN** `POST /api/ml/lstm/predict` returns HTTP 503 directing the operator to run `npm run train:lstm`

### Requirement: LSTM metrics include hit, val loss, and prize simulation

LSTM training metrics SHALL include (1) holdout/test **hit-count** summary for top-6 vs actual main six, (2) **validation loss / overfitting summary**, and (3) **rank/prize simulation** summary under documented simplified assumptions. Metrics SHALL NOT invent precision/recall/F1 win scores.

#### Scenario: Metrics file content

- **WHEN** training completes successfully
- **THEN** metrics include numeric hit summary, val-loss/overfit fields, and prize/rank simulation fields

### Requirement: Predictor LSTM mode UX

The Predictor tab SHALL offer an LSTM ML mode distinct from stats and Random Forest. In LSTM mode the UI SHALL show cache status and the three metric families, an experimental disclaimer (independent trials; metrics ≠ win probability), and a control to call `POST /api/ml/lstm/predict`.

#### Scenario: User selects LSTM mode

- **WHEN** the user selects LSTM ML mode
- **THEN** the UI shows LSTM status metrics when available and does not apply statistical weight-profile controls to the LSTM path

#### Scenario: Generate LSTM candidate

- **WHEN** the user generates an LSTM recommendation with an available model
- **THEN** the UI displays the six numbers with method `lstm-ml`

### Requirement: LSTM recommendations save to history

When a logged-in user saves an LSTM-generated recommendation, the system SHALL store it in Firestore with `method: "lstm-ml"` along with numbers and `latestRound`, and MAY include metric snapshot fields without fabricated confidence percentages.

#### Scenario: Save LSTM prediction

- **WHEN** a logged-in user saves a successful LSTM predict result
- **THEN** the stored record is distinguishable via `method: "lstm-ml"` from `weighted-random` and `random-forest-ml` saves
