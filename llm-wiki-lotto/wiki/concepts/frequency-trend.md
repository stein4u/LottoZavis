---
type: concept
title: "빈도 행보"
description: "번호별 30게임 빈도 변화 추이를 시계열로 읽는 방법"
tags: [concept, frequency, trend]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/220359449998_650회차-기준-숫자별-빈도행보.md
  - raw/lotto/220374045626_로또-분석-이야기-25.-빈도-행보의-이해.md
  - raw/lotto-freq-trend.json
---

# 빈도 행보

## 정의

최근 N게임(보통 120게임) 동안, 각 번호의 **30게임 빈도**가 회차별로 어떻게 변했는지를 나열한 시계열.

- **재계산 결과**: [[analyses/freq-trend-2026-07-05]] (1231회 기준, `raw/lotto-freq-trend.json`)
- **역사적 예시**: `raw/lotto/220359449998_650회차-기준-숫자별-빈도행보.md`, [[sources/per-draw-predictions]]

## 읽는 법 (45번 예시)

### cryingbird (650회)

`2, 3(출), 3, ...` 의미:

- 120게임 전: 30빈도표에서 2빈도 위치
- 119게임: 3빈도 위치 + **출현** (괄호 표시)
- 이후 2→6까지 상승 후 2까지 하락, 다시 5까지 상승 = **상승세·평균 행보**

### 현행 (1231회, 재계산)

45번 최근 15게임 꼬리: `4, 5(출), 6(출), 5, 5, 5, 5, 6(출), 6, 5, 5, 5, 5, 5, 5`

- 현재 freq30 = **5**, 추세 **stable**, 1231회 **미출현**
- 6(출) 직후 5빈도 유지 → cryingbird 프레임에서 **제외수 검토** 구간

→ 상세: [[analyses/freq-trend-2026-07-05]]

## 판단 기준

| 패턴 | 해석 |
|------|------|
| 급격한 상승 추세 | 몰림 4~5회, 단기 출현 가능성 높음 (저자 관점) |
| 평균 행보 + 몰림 2~3회 | 단기 출현 가능, 연속 출현은 어려움 |
| 출현 후 빈도 유지 | 하향 전환 지연 — 당회차 출현 후 [[concepts/exclusion-numbers|제외수]] 후보 |
| 출현 없음 + 몰림 종료 | 7~10게임 후 재편입 고려 |

## 활용

- [[concepts/exclusion-numbers|제외수]]·유력수 선정 보조
- [[concepts/lottojotto|로또조또]] 분석 도구 (2015년 글 기준)
- 재계산: `python scripts/compute_freq_trend.py` → `raw/lotto-freq-trend.json`

## 데이터

| 파일 | 내용 |
|------|------|
| `raw/lotto-freq-trend.json` | 45번호 × 120게임 시계열 + display 문자열 |
| `scripts/compute_freq_trend.py` | 재계산 스크립트 |
