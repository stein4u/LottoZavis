## ADDED Requirements

### Requirement: RF model trains on refresh with main-six all-history data

The system SHALL train a Random Forest appearance-score model from `data/lotto-draws.json` after a successful draw ingest or incremental refresh. Training SHALL use all historical rounds as the data source, SHALL exclude bonus numbers from features and labels, and SHALL build per-number labels indicating main-six appearance in each target round using only prior-round information for features.

#### Scenario: Refresh triggers training attempt

- **WHEN** `incrementalRefresh` or admin refresh completes successfully and Python + dependencies are available
- **THEN** the system writes a cached model artifact and a metrics file under `data/ml/` tagged with the cache `latestRound`

#### Scenario: Refresh succeeds without Python

- **WHEN** draw refresh succeeds but Python or sklearn is unavailable
- **THEN** the draw cache update still succeeds and ML status reports the model as unavailable without failing the refresh

### Requirement: Cached RF predict API

The system SHALL expose `POST /api/ml/rf/predict` that loads the cached model (no on-request training) and returns exactly six unique integers in 1–45 sorted ascending, with `method: "random-forest-ml"` and metadata including `latestRound` and `trainedAt` from the cache.

#### Scenario: Predict with warm cache

- **WHEN** a valid model cache exists and a client calls `POST /api/ml/rf/predict`
- **THEN** the response includes six sorted unique numbers and `method: "random-forest-ml"`

#### Scenario: Predict with cold cache

- **WHEN** no model cache exists and a client calls `POST /api/ml/rf/predict`
- **THEN** the system returns HTTP 503 with a clear error that training/refresh is required

### Requirement: ML status exposes R2 and hit-count metrics

The system SHALL expose `GET /api/ml/rf/status` returning whether the model is available and evaluation metrics from the last training run, including holdout **R²** (`r2`) and backtest **hit-count** summary (`hitMean`, and hit distribution or equivalent), plus `latestRound` and `trainedAt`. Metrics SHALL reflect chronological holdout evaluation, not fabricated scores.

#### Scenario: Status with trained model

- **WHEN** metrics were written by the last successful train
- **THEN** `GET /api/ml/rf/status` returns `available: true` with numeric `r2` and `hitMean` fields

#### Scenario: Status without model

- **WHEN** no metrics/model files exist
- **THEN** `GET /api/ml/rf/status` returns `available: false` without inventing metric values

### Requirement: Predictor ML subsection UX

The Predictor tab SHALL provide a mode to use the cached Random Forest path distinct from statistical weighted-random recommendation. In ML mode the UI SHALL show cache/metrics status (including R² and hit-count), an honest disclaimer that metrics do not imply win probability, and a control to request `POST /api/ml/rf/predict`.

#### Scenario: User switches to ML mode

- **WHEN** the user selects the Random Forest ML mode in Predictor
- **THEN** the UI shows ML status metrics when available and does not present weight-profile biases as controlling the RF model

#### Scenario: Generate ML candidate

- **WHEN** the user generates an ML recommendation with an available model
- **THEN** the UI displays the six returned numbers and associates them with method `random-forest-ml`

### Requirement: ML recommendations save to history

When a logged-in user saves an ML-generated recommendation, the system SHALL store it in Firestore prediction history with method metadata identifying Random Forest ML (e.g. `method: "random-forest-ml"`) along with numbers and available training context such as `latestRound`.

#### Scenario: Save ML prediction

- **WHEN** a logged-in user saves a successful ML predict result
- **THEN** the stored record includes the six numbers and ML method metadata distinguishable from `weighted-random` saves
