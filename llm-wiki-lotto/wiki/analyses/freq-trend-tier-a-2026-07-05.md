---
type: analysis
title: "30게임 빈도 행보 Tier A 2026-07-05"
description: "1230회 기준 보너스 포함 30게임 freq30 행보"
tags: [analysis, frequency-trend, tier-a]
created: 2026-07-05
updated: 2026-07-05
sources:
  - data/lotto-draws.json
---

# 30게임 빈도 행보 Tier A (2026-07-05)

> **Tier A (보너스 포함)** — `freq30`은 최근 30회 **main 6 + bonus** 출현 횟수. 앱 Analysis와 동일 — [[POLICY]]

`scripts/compute_tier_a_from_app_cache.py` → `data/lotto-draws.json`

## 계산 정의

| 항목 | 값 |
|------|-----|
| 롤링 윈도우 | **30게임** (해당 회차 포함) |
| 시계열 길이 | **120게임** (1111~1230회) |
| `freq30` | 최근 30회 main+bonus 중 해당 번호 출현 횟수 |
| `(출)` | 해당 회차에 당첨·보너스로 출현 |

기대값: 30×7÷45 = **4.67회/번호**

## 1230회 당첨 번호 행보

당첨: `3, 8, 9, 22, 28, 42` + 보너스 `45` (2026-06-27)

| 번호 | freq30 | 10회 추세 | 1230회 출현 |
|------|--------|-----------|-------------|
| 3 | 5 | stable | 출 |
| 8 | 5 | stable | 출 |
| 9 | 6 | rising | 출 |
| 22 | 4 | rising | 출 |
| 28 | 8 | rising | 출 |
| 42 | 6 | rising | 출 |

## 현재 freq30 순위 (1230회 시점)

### 상위 (몰림 구간)

| 번호 | freq30 | 10회 추세 | 연속 출현 |
|------|--------|-----------|-----------|
| 27 | 10 | stable | 0 |
| 28 | 8 | rising | 1 |
| 31 | 8 | stable | 0 |
| 25 | 7 | stable | 0 |
| 41 | 7 | rising | 0 |
| 45 | 7 | stable | 1 |

### 하위 (뜸한 구간)

| 번호 | freq30 | 10회 추세 |
|------|--------|-----------|
| 43 | 1 | stable |
| 40 | 2 | falling |
| 12 | 2 | stable |

## 45번 비교 (cryingbird 650회 예시 vs 현재)

**1230회 기준 45번** (최근 15게임 꼬리, Tier A):

```
6, 6, 7(출), 8(출), 7, 7, 7, 7, 8(출), 8, 7, 7, 7, 7, 7(출)
```

| 항목 | cryingbird (650회) | 현재 (1230회 Tier A) |
|------|-------------------|----------------------------------------|
| 현재 freq30 | 5 | **7** |
| 최근 추세 | 상승 후 평균 유지 | **stable** |
| 1230회 출현 | — | **보너스(출)** |

## cryingbird 이론 대조

1. **30게임 분기점**: 1201~1230 최근 30회에서 **미출현 번호 0개**
2. **이격**: freq30 범위 **1~10** (기대 4.67 대비)
3. **베르누이**: 행보는 과거 패턴이며 1231회 확률은 불변 — [[concepts/bernoulli-and-lln]]

## Legacy 참고

- Tier B 행보: [[analyses/freq-trend-2026-07-05]] (메인 6볼, 로컬 CSV 1231회)

## 관련

- [[sources/dhlottery-official-draws]]
- [[entities/draws/draw-1230]]
- [[analyses/frequency-snapshot-tier-a-2026-07-05]]
