---
type: analysis
title: "위키 종합 결론 2026-07-05"
description: "cryingbird 방법론 + 동행복권 1230회 Tier A 데이터 종합"
tags: [analysis, synthesis, overview]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/README.md
  - data/lotto-draws.json
  - wiki/overview.md
---

# 위키 종합 결론 2026-07-05

> **Tier A canonical** — 아래 수치는 LottoZavis 앱 `data/lotto-draws.json` (1~1230회, 보너스 포함) 기준. Tier B legacy — [[POLICY]], [[analyses/frequency-snapshot-2026-07-05]]

방법론(cryingbird 79편)과 실데이터(동행복권 1~1230회)를 결합한 위키의 **현재 결론**.

## 1. 로또의 본질

| 시간 축 | 특성 | 분석 의미 |
|---------|------|-----------|
| 매 회차 | [[concepts/bernoulli-and-lln|베르누이 독립 시행]] | 1등 확률 1/8,145,060 불변 |
| 단기 (10~30게임) | [[concepts/frequency-deviation|빈도 이격]] | 통계적 편차 활용 여지 |
| 장기 (1000회+) | 대수의 법칙 | 출현 균등화 **수렴 중** |

1230회 Tier A 실측: 번호별 빈도 **162~212** (기대 191.33) → 장기에도 이격 존재. → [[analyses/frequency-snapshot-tier-a-2026-07-05]]

단기 freq30 이격 **1~10** (기대 4.67), 30회 미출현 0개 → [[analyses/freq-trend-tier-a-2026-07-05]]

## 2. 분석의 실제 목표

**"이 번호가 나온다"가 아니라 "말 안 되는 조합을 걸러낸다".**

```
45번호 → 제외수 축소 → 통계필터 → 필터링(500조합) → 최종 조합
```

중심 원칙: [[concepts/combination-over-numbers|수가 아닌 조합]]

## 3. 핵심 도구 4가지

| 도구 | 역할 | 위키 |
|------|------|------|
| 제외수 | 조합 공간 축소 | [[concepts/exclusion-numbers]] |
| 빈도 이격·행보 | 단기 편차 읽기 | [[concepts/frequency-deviation]], [[concepts/frequency-trend]] — Tier A: [[analyses/freq-trend-tier-a-2026-07-05]] |
| 기본 통계 필터 | 홀짝·총합·전멸 등 | [[concepts/basic-stat-filters]] |
| 필터링 | 500조합 표본 추출 | [[concepts/filtering]] |

보조 개념: [[concepts/clustering-dispersion]], [[concepts/limit-deviation]], [[concepts/reappearance-gap]]

## 4. 방법론 진화 (37화 시리즈)

후반으로 갈수록 **개별 번호 → 조합·분포·이격의 거시적 읽기**로 수렴.

→ [[sources/analysis-stories-series]], [[sources/chapter-a-foundation]]

## 5. 비판적 결론

**분석이 하는 일**
- 말이 안 되는 조합 대량 제거 (조합 공간 축소)
- 3~5등 소액 당첨 빈도 향상 **가능성** (저자 경험)

**분석이 못 하는 일**
- 다음 회차 당첨 번호 예측
- 1등 당첨 보장
- 2014~2016 예측 글의 사후 검증 (→ [[sources/per-draw-predictions]])

**버려야 할 것**: 선형·회귀, 고정수, 번호 제공업체 맹신

> [!warning] 4·29화와 이론의 긴장
> "1등이 보인다"(4화), "유력 1조합은 정해져 있다"(29화)는 실전 톤이나, [[concepts/bernoulli-and-lln|베르누이 전제]]와 긴장. 조합 필터링 효과로 **재해석**해야 함.

## 6. 한 문장 결론

> 로또는 매 회차 독립이라 예측할 수 없지만, 단기 빈도 이격과 조합 통계로 말 안 되는 조합을 걸러낼 여지는 있다. 위키의 가치는 1등 예측이 아니라 **분석 프레임워크 + 검증 가능한 통계**의 축적.

## 관련

- [[overview]]
- [[sources/cryingbird-blog-collection]]
- [[sources/dhlottery-official-draws]]
- [[analyses/frequency-snapshot-tier-a-2026-07-05]]
- [[analyses/freq-trend-tier-a-2026-07-05]]
