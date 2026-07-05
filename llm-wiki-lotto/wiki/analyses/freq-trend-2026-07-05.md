---
type: analysis
title: "30게임 빈도 행보 2026-07-05"
description: "1231회 기준 45개 번호 120게임 빈도 행보 시계열 재계산"
tags: [analysis, frequency-trend, snapshot]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto-draws.csv
  - raw/lotto-freq-trend.json
---

# 30게임 빈도 행보 2026-07-05

> **정책 drift (Tier B legacy)**  
> `freq30`은 **메인 6볼만** 집계(`30×6÷45`, 기대 4.0)입니다. 앱 Analysis·위키 canonical 빈도는 **보너스 포함 Tier A** — [[POLICY]]. Tier A 행보 재산출은 Phase 0.5 예정.

`scripts/compute_freq_trend.py`로 `raw/lotto-draws.csv`에서 재계산. 결과: `raw/lotto-freq-trend.json`

## 계산 정의

| 항목 | 값 |
|------|-----|
| 롤링 윈도우 | **30게임** (해당 회차 포함) |
| 시계열 길이 | **120게임** (1112~1231회) |
| `freq30` | 최근 30회 당첨 6볼 중 해당 번호 출현 횟수 |
| `(출)` | 해당 회차에 당첨 번호로 출현 |

기대값: 30×6÷45 = **4.0회/번호**

## 1231회 당첨 번호 행보

당첨: `4, 13, 14, 18, 31, 38` (2026-07-04)

| 번호 | freq30 | 10회 추세 | 1231회 출현 |
|------|--------|-----------|-------------|
| 4 | 4 | rising | 출 |
| 13 | 5 | rising | 출 |
| 14 | 3 | rising | 출 |
| 18 | 5 | rising | 출 |
| 31 | 7 | stable | 출 |
| 38 | 6 | stable | 출 |

당첨 6개 모두 **rising 또는 stable** — 단기 상승·유지 구간에서 출현.

## 현재 freq30 순위 (1231회 시점)

### 상위 (몰림 구간)

| 번호 | freq30 | 10회 추세 | 연속 출현 |
|------|--------|-----------|-----------|
| 27 | 8 | stable | 0 |
| 28, 31 | 7 | stable | 31만 1회 |
| 38, 42, 44 | 6 | stable/rising | 38만 1회 |

### 하위 (뜸한 구간)

| 번호 | freq30 | 10회 추세 |
|------|--------|-----------|
| 43 | 1 | stable |
| 7 | 1 | falling |
| 40 | 2 | falling |
| 11, 12 | 2 | stable |

## 45번 비교 (cryingbird 650회 예시 vs 현재)

cryingbird(`concepts/frequency-trend`) 45번 사례: 2→6 상승 후 5 유지, 평균 행보·몰림 2~3회.

**1231회 기준 45번** (최근 15게임 꼬리):

```
4, 5(출), 6(출), 5, 5, 5, 5, 6(출), 6, 5, 5, 5, 5, 5, 5
```

| 항목 | cryingbird (650회) | 현재 (1231회) |
|------|-------------------|---------------|
| 현재 freq30 | 5 | **5** |
| 최근 추세 | 상승 후 평균 유지 | **stable** |
| 1231회 출현 | — | **없음** |
| 해석 (저자 프레임) | 단기 출현 후 제외수 후보 | 6(출) 직후 5로 유지 → 제외수 검토 구간 |

패턴 구조가 cryingbird 기술과 **유사** (5~6 빈도대 머무름, 출현 후 빈도 유지).

## cryingbird 이론 대조

1. **30게임 분기점**: 1202~1231 최근 30회에서 **미출현 번호 0개** — 모든 번호 1회 이상 출현 (챕터 A-3와 일치)
2. **이격**: freq30 범위 **1~8** (기대 4.0 대비) — [[concepts/frequency-deviation]] 단기 이격 존재
3. **베르누이**: 위 행보는 과거 패턴이며 1232회 확률은 불변 — [[concepts/bernoulli-and-lln]]

## 활용

- 전체 45번호 `display_120` 문자열: `raw/lotto-freq-trend.json`
- 재계산: `python scripts/compute_freq_trend.py`
- 개념: [[concepts/frequency-trend]], [[concepts/exclusion-numbers]], [[concepts/clustering-dispersion]]

## 관련

- [[sources/dhlottery-official-draws]]
- [[entities/draws/draw-1231]]
- [[analyses/frequency-snapshot-2026-07-05]]
