---
type: concept
title: "빈도 이격"
description: "정상·평균 빈도 대비 번호별 출현 빈도의 편차"
tags: [concept, frequency, deviation]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/220367883675_챕터A.-로또-분석의-해법을-찾아서-3.-로또-분석의-해법-제시.md
  - raw/lotto/220372470855_로또-분석-이야기-24.단기-빈도-이격의-이해.md
---

# 빈도 이격

> **Tier 안내**  
> cryingbird 원문·651회 예시는 **메인 6볼(Tier B)** 관행이 많다. LottoZavis 앱 빈도·미출현·동반 출현은 **보너스 포함 Tier A**. 페이지마다 Tier를 확인 — [[POLICY]].

## 정의

특정 기간(10·30·120게임 등) 동안 각 번호의 출현 빈도가 **수학적 평균에서 벗어난 정도**.

출처: `raw/lotto/220367883675_...3.-로또-분석의-해법-제시.md`

## 핵심 수치 (651회차 기준 예시)

| 기간 | 기대 평균 | 실제 관찰 |
|------|-----------|-----------|
| 10게임 | 모든 수 1회+ 출현 기대 | 빈도 0~4로 분산 |
| 30게임 | 4.66회 출현 기대 | 빈도 0~10으로 넓게 분산 |

30게임은 모든 수가 최소 1회 출현하는 **분기점**, 이격 분포가 **가우스 정규분포** 형태를 띤다. → [[sources/chapter-a-foundation#3부-해법-제시|챕터 A-3]]

### 1231회 실측 (1202~1231, 30게임)

| 항목 | 값 | 출처 |
|------|-----|------|
| freq30 범위 | 1~8 (기대 4.0) | [[analyses/freq-trend-2026-07-05]] |
| 미출현 번호 | 0개 | [[analyses/frequency-snapshot-2026-07-05]] |
| 몰림 상위 | 27(8), 28·31(7) | [[analyses/freq-trend-2026-07-05]] |

## 변형 개념 (시리즈 24~37화)

| 개념 | 화수 | 설명 |
|------|------|------|
| 단기 빈도 이격 | 24 | [[concepts/frequency-deviation]] — 짧은 구간 편차 |
| 빈도 이격 응용 | 28 | [[concepts/frequency-deviation]] — 실전 적용 |
| 빈도 이격 조정 | 33 | [[concepts/frequency-deviation]] — 파라미터 조정 |
| 한계 이격 | 34 | [[concepts/limit-deviation]] |
| 재출현 간격 이격 | 35 | [[concepts/reappearance-gap]] |

## 분석 활용

- 이격이 큰 번호 = 단기적으로 "뜸한" 또는 "몰린" 수
- [[concepts/frequency-trend|빈도 행보]]와 결합하여 추세 판단 — 실측: [[analyses/freq-trend-2026-07-05]]
- [[concepts/filtering|필터링]]·[[concepts/lottojotto|로또조또]]에서 자동 반영

## 주의

이격은 **과거 빈도 패턴**이며, [[concepts/bernoulli-and-lln|베르누이 독립성]]에 따라 다음 회차 확률은 변하지 않는다.
