---
type: concept
title: "조합 분석 (수가 아닌 조합)"
description: "개별 번호가 아닌 6개 조합 단위로 접근하는 핵심 원칙"
tags: [concept, combination, strategy]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/220362284348_로또-분석-이야기-20.-수를-취하지-말고-조합을-취하라..md
  - raw/lotto/220366100092_로또-분석-이야기-21.-조합-방법-간단-요약.md
---

# 조합 분석 (수가 아닌 조합)

## 핵심 원칙

**개별 번호(수)를 고르지고, 6개 조합 전체를 선택하라.**

출처: `raw/lotto/220362284348_...20.-수를-취하지-말고-조합을-취하라..md`

## 이유

1. 로또 당첨 단위는 **6개 번호의 조합**이지 개별 번호가 아님
2. 번호별 분석은 [[concepts/bernoulli-and-lln|베르누이 독립성]]과 충돌 — "이 번호가 나올 것"은 매 회 동일 확률
3. [[concepts/basic-stat-filters|홀짝·총합·전멸·색깔]] 등은 **조합 속성**으로야 의미 있음
4. [[concepts/filtering|필터링]]·[[concepts/lottojotto|로또조또]]는 조합 단위 점수·필터

## 실천

- 21화: 조합 방법 간단 요약
- [[concepts/exclusion-numbers|제외수]]로 후보 축소 → 조합 생성
- 29화: "매주 가장 유력한 1조합" — 주간 최적 **조합** 1개 관점

> [!warning] 29화 해석
> "정해진 1조합"은 [[concepts/bernoulli-and-lln|베르누이 전제]]와 긴장. 필터·이격 기준 **최적 후보**이지 당첨 예측이 아님. → [[sources/analysis-stories-series#이론과-긴장하는-화]]

## 위키 관점

cryingbird 방법론의 **중심 축**. 번호 엔티티(`entities/numbers/`)보다 조합·패턴·필터 개념이 우선.
