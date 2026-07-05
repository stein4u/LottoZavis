---
type: overview
title: "로또 분석 위키 개요"
description: "위키 전체 종합 — ingest마다 갱신"
tags: [overview]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/README.md
  - raw/lotto-draws.csv
---

# 로또 분석 위키 개요

## 정책 (Phase 0)

- **저장소**: git에는 `wiki/` + `AGENTS.md`만 — `raw/`는 로컬
- **통계**: Tier A(보너스 포함) = 앱 canonical; legacy analyses는 Tier B 콜아웃
- **톤**: 당첨 예측 아님, 조합 필터·실데이터 참고 — [[POLICY]]

## 현재 상태

- **방법론**: cryingbird 블로그 79편 흡수 완료
- **공식 데이터**: 동행복권 **1~1231회** 당첨 CSV 수집 (2026-07-05)
- **최신 회차**: 1231회 — `4, 13, 14, 18, 31, 38` + 보너스 `15` (2026-07-04)

## 소스

| 유형 | 위키 | 원본 |
|------|------|------|
| 방법론 | [[sources/cryingbird-blog-collection]] | `raw/lotto/` 79편 |
| 이론 기초 | [[sources/chapter-a-foundation]] | 챕터 A 3부작 |
| 교육 시리즈 | [[sources/analysis-stories-series]] | 분석 이야기 1~37 |
| 당첨 데이터 | [[sources/dhlottery-official-draws]] | `raw/lotto-draws.csv` |

## 이론 + 데이터 결합

1. **이론** (cryingbird): [[concepts/bernoulli-and-lln|베르누이]] + [[concepts/frequency-deviation|이격]] + [[concepts/combination-over-numbers|조합 분석]]
2. **데이터** (동행복권): 1231회 실측 빈도 — [[analyses/frequency-snapshot-2026-07-05]], 30게임 행보 — [[analyses/freq-trend-2026-07-05]]
3. **검증**: 1231회에서도 번호 빈도 136~184로 이격 존재 → 대수의 법칙 "수렴 중" 해석. 단, **다음 회차 확률은 불변**.

## 비판적 결론

- 방법론 = 조합 공간 축소·필터링. 1등 확률(1/8,145,060) 자체는 변하지 않음.
- cryingbird 650회 빈도행보 예시는 **역사적 참고**. 현행 행보는 [[analyses/freq-trend-2026-07-05]] (공식 CSV 재계산).
- 2014~2016 회차 예측 글([[sources/per-draw-predictions]])은 사후 검증 없음.

## 다음 단계

1. Phase 0.5: Tier A analyses 재산출 (앱 `data/lotto-draws.json` 기준)
2. Phase 1: LottoZavis WikiTab ← `wiki/` Reader
3. 특정 번호·회차 deep-dive (`wiki-query`)

## 현재 결론

**이론(cryingbird) + 실데이터(동행복권 1231회)**가 결합된 상태. 위키는 "당첨 예측"이 아니라 **분석 프레임워크 + 검증 가능한 통계**를 축적하는 용도.

→ 상세 종합: [[analyses/wiki-synthesis-2026-07-05]]
