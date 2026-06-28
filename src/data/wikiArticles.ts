import { WikiArticle } from "../types";

export const preseededArticles: WikiArticle[] = [
  {
    id: "system_overview",
    title: "1. 로또 예측 시스템 개요",
    category: "개요 (Overview)",
    summary: "기술 통계와 머신 러닝을 결합하여 무작위에 가까운 로또 번호에서 통계적 패턴을 추출하는 현대적 접근론을 설명합니다.",
    content: `
## 📊 로또 예측 시스템 개요: 과학적 접근론

로또(Lotto)는 완벽한 무작위 독립 시행처럼 보이지만, 장기적인 데이터 축적을 통해 특정 **통계적 균형**과 **밀도 패턴**이 형성됩니다. 본 예측 시스템은 단순한 운이나 미신적 선택이 아닌, **과거 당첨 데이터(Big Data)**를 수집 분석하여 통계적 특이성과 머신 러닝 알고리즘을 통한 확률적 후보군을 탐색하는 데 목적이 있습니다.

### 💡 시스템의 핵심 철학
1. **독립 시행과 대수의 법칙 (Law of Large Numbers)**: 로또 번호는 매회 독립 시행이지만, 무수히 반복되면 홀짝 비율(50:50), 고저 비율, 총합 평균 등 통계적 대표값이 특정 구간으로 수렴합니다.
2. **패턴 차단 및 필터링 (Pattern Filtering)**: 출현 확률이 0.1% 미만인 조합(예: 1, 2, 3, 4, 5, 6 또는 극단적인 짝수 위주 조합)을 알고리즘 필터를 통해 사전 차단합니다.
3. **앙상블 기법 (Ensemble Approach)**: 여러 개의 독립된 알고리즘(Random Forest, XGBoost, LSTM)의 가중 평균 및 투표를 통해 최종 후보 번호를 결정합니다.

---

### 🛠️ 데이터 파이프라인 아키텍처
본 예측 시스템은 아래와 같은 다단계 파이프라인으로 구성되어 있습니다:

\`\`\`
[과거 당첨번호 크롤링] ➔ [기술 통계 분석 (홀짝/고저/총합)] ➔ [머신 러닝 피처 엔지니어링] ➔ [예측 모델 학습] ➔ [최적 후보군 필터링] ➔ [최종 예측 번호 제공]
\`\`\`
`,
    codeSnippet: `import pandas as pd
import numpy as np

# 과거 로또 데이터 로드 및 기초 통계 가공
def load_lotto_data(filepath):
    df = pd.read_csv(filepath)
    # 홀짝 비율 계산
    df['odd_count'] = df[['n1','n2','n3','n4','n5','n6']].apply(lambda x: sum(i % 2 != 0 for i in x), axis=1)
    df['even_count'] = 6 - df['odd_count']
    # 번호 합산 계산
    df['sum_val'] = df[['n1','n2','n3','n4','n5','n6']].sum(axis=1)
    return df`
  },
  {
    id: "random_forest",
    title: "2. Random Forest 알고리즘의 예측 원리",
    category: "머신 러닝 (Machine Learning)",
    summary: "의사결정 나무(Decision Tree)의 앙상블 모델인 랜덤 포레스트를 활용해 각 번호의 독립 변수 중요도와 당첨 확률을 예측합니다.",
    content: `
## 🌲 Random Forest를 활용한 로또 예측 메커니즘

**랜덤 포레스트(Random Forest)**는 대표적인 배깅(Bagging) 기법 알고리즘으로, 수많은 의사결정 나무(Decision Trees)를 무작위로 생성한 뒤 그 결과들의 평균 또는 다수결 투표를 통해 안정적인 예측값을 산출합니다.

### 🔍 로또 피처 엔지니어링 (Feature Engineering)
단순 번호 자체를 예측하는 것은 정밀하지 못하므로, 랜덤 포레스트에서는 특정 번호가 다음 회차에 출현할 것인가(Binary Classification: 0 또는 1)를 예측하기 위해 다양한 파생 변수를 학습시킵니다:

1. **최근 출현 빈도 (Rolling Frequency)**: 해당 번호가 최근 5회, 10회, 25회 동안 출현한 횟수.
2. **미출현 기간 (Long-tail Inactive Draw)**: 해당 번호가 마지막으로 출현한 이후 현재까지 지나간 회차의 수.
3. **동반 출현 횟수 (Co-occurrence Matrix)**: 타 번호와 쌍을 이루어 함께 당첨된 빈도수.
4. **이웃 번호 출현 여부 (Neighbor State)**: 인접한 번호가 전 회차에 등장했는지 여부.

---

### ⚙️ 모델의 예측 및 과적합 방지
로또 예측에 랜덤 포레스트가 유리한 이유는 개별 트리의 노이즈가 전체 숲의 조화를 통해 상쇄되어 **과적합(Overfitting)** 위험이 상대적으로 낮기 때문입니다. 아래 파이썬 코드를 통해 모델 학습의 표준 형태를 확인할 수 있습니다.
`,
    codeSnippet: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# 모델 피처셋과 타겟 레이블 설정 (X: 파생 지표, y: 당첨 여부)
X = lotto_features[['rolling_freq_5', 'inactive_draws', 'co_occur_index', 'even_ratio_last_draw']]
y = lotto_features['is_drawn']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 랜덤포레스트 하이퍼파라미터 튜닝 및 학습
model = RandomForestClassifier(n_estimators=500, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# 각 번호별 출현 확률(Probability) 예측값 추출
probabilities = model.predict_proba(X_test)[:, 1]`
  },
  {
    id: "xgboost",
    title: "3. XGBoost를 활용한 회귀 및 순위 기법",
    category: "머신 러닝 (Machine Learning)",
    summary: "경사 하강 부스팅 기법인 XGBoost 모델을 사용하여 각 번호가 가질 확률 잔차(Residual)를 보정하고 최종 6개 번호의 중요 순위를 예측합니다.",
    content: `
## 🚀 XGBoost (eXtreme Gradient Boosting) 예측 분석

**XGBoost**는 Gradient Boosting 프레임워크의 고도로 최적화된 구현체로, 병렬 연산 및 정규화(L1, L2 Regularization)를 통해 우수한 속도와 극대화된 예측력을 자랑합니다.

### 📝 잔차 학습 (Residual Learning)을 통한 예측 정밀화
XGBoost는 이전 단계 트리들이 저지른 오류(잔차, Residuals)를 다음 트리가 가중 학습하는 방식으로 작동합니다. 로또 분석에서는 다음 사항에 주안점을 둡니다:

- **목적 함수 (Objective Function)**: \`binary:logistic\`을 사용하여 45개 번호 각각의 시계열 당첨 확률 값을 구합니다.
- **최적의 학습률 조율**: 너무 과도한 학습을 피하기 위해 학습률(learning_rate 또는 eta)을 0.01~0.05 사이로 매우 보수적으로 설정하여 미세한 통계적 편향을 천천히 학습합니다.
- **조기 종료 (Early Stopping)**: 검증 셋의 손실(logloss)이 더 이상 감소하지 않는 구간에서 학습을 중단하여 과적합을 철저하게 제어합니다.
`,
    codeSnippet: `import xgboost as xgb

# XGBoost 전용 DMatrix 행렬 생성
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
    'max_depth': 6,
    'eta': 0.02,
    'objective': 'binary:logistic',
    'eval_metric': 'logloss',
    'alpha': 0.1,  # L1 정규화 가중치
    'lambda': 1.0  # L2 정규화 가중치
}

# 학습 진행 (조기 종료 설정)
evallist = [(dtest, 'eval'), (dtrain, 'train')]
num_round = 1000
bst = xgb.train(params, dtrain, num_round, evallist, early_stopping_rounds=50)`
  },
  {
    id: "lstm",
    title: "4. 딥러닝 LSTM 시계열 순차 예측",
    category: "딥러닝 (Deep Learning)",
    summary: "시계열 장기 의존성(Long Short-Term Memory) 신경망 모델을 활용해 이전 10회차 당첨 흐름이 다음 회차 당첨에 미치는 순차적 흐름을 모델링합니다.",
    content: `
## 🧠 LSTM (Long Short-Term Memory) 순차 신경망 모델

로또 번호의 과거 흐름은 단순 정적 통계 외에 시간의 흐름에 따른 **시계열 동역학**을 가질 수 있습니다. **LSTM**은 순환 신경망(RNN)의 기울기 소실 문제를 극복하고 장기간의 의존 관계를 기억할 수 있는 딥러닝 아키텍처입니다.

### ⛓️ 순차 데이터 포매팅 (Sequence Input)
시간 연속선상에서의 당첨 양상을 파악하기 위해 다차원 입력을 구성합니다:
- **입력 텐서 구조**: \`[Batch Size, Time Steps, Features]\`
  - \`Time Steps = 10\`: 이전 10회 분의 당첨 결과(1부터 45까지 원-핫 인코딩 벡터 45차원)를 입력으로 하여, 그 다음 회차의 45개 멀티 클래스 또는 멀티 레이블 아웃풋을 예측합니다.

---

### 🕸️ LSTM 아키텍처 및 손실 함수
- LSTM 셀 이후 Dense 레이어를 거쳐 최종 출력단에 \`sigmoid\` 활성화 함수를 배치합니다. 
- 이를 통해 각 번호가 독립적으로 가질 당첨 기댓값 확률을 0과 1사이의 실수로 도출합니다.
`,
    codeSnippet: `import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# LSTM 기반 시계열 예측 모델 생성
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(10, 45)),
    Dropout(0.2),
    LSTM(32, return_sequences=False),
    Dropout(0.2),
    Dense(45, activation='sigmoid') # 45개 번호 각각의 확률값
])

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
# model.fit(X_train_seq, y_train_seq, epochs=50, batch_size=16)`
  },
  {
    id: "stats_theory",
    title: "5. 기술 통계적 확률 분석론",
    category: "확률 통계 (Statistics)",
    summary: "로또 번호 선택에서 가장 신뢰할 수 있는 수학적 등가 지표인 홀짝 비율, 총합 구간, 고저 비율 등의 대표 기술 통계를 알아봅니다.",
    content: `
## 📈 기술 통계적 확률 분석론: 상식적인 범위의 번호 추려내기

아무리 고성능 머신러닝 모델이라도 자연계의 기본적인 물리법칙 및 통계법칙을 위배하는 결과를 내서는 안 됩니다. 기술 통계적 분석론은 **'기본적인 범위 내에서의 건강한 제한'**을 의미합니다.

### 1. 홀수와 짝수의 비율 (Odd : Even Ratio)
로또 6개 번호의 홀수와 짝수 조합은 수학적으로 **3:3** 또는 **2:4**, **4:2** 조합이 전체 당첨 케이스의 약 **80% 이상**을 차지합니다. 극단적인 0:6 또는 6:0은 역사상 매우 드뭅니다.

### 2. 총합 분포 범위 (Sum Range Distribution)
6개 번호의 합은 대략 중앙값 근처에 모이는 정규분포 곡선을 그립니다:
- **최저합**: 1+2+3+4+5+6 = 21
- **최고합**: 40+41+42+43+44+45 = 255
- **황금 밀도 구간**: **100 ~ 175** 사이의 총합을 가진 당첨이 무려 75% 이상을 차지합니다.

### 3. 고저 비율 (High : Low Ratio)
1~45번을 절반으로 쪼개어, 1~22를 **'저(Low)'**, 23~45를 **'고(High)'**라고 정의할 때, 고저 역시 **3:3**, **2:4**, **4:2** 조합이 핵심적인 안전 범위에 속합니다.
`,
    codeSnippet: `# 필터링 함수 구현 예시
def is_valid_lotto_combination(nums):
    # 1. 정렬
    sorted_nums = sorted(nums)
    # 2. 총합 검사
    total_sum = sum(sorted_nums)
    if not (100 <= total_sum <= 180):
        return False
    # 3. 홀짝 검사
    odds = sum(1 for n in sorted_nums if n % 2 != 0)
    if odds in [0, 6]: # 극단적인 홀짝은 제외
        return False
    # 4. 연번(연속된 번호) 검사
    consecutives = sum(1 for i in range(5) if sorted_nums[i+1] - sorted_nums[i] == 1)
    if consecutives >= 3: # 3개 이상의 연속 번호 필터링
        return False
    return True`
  }
];
