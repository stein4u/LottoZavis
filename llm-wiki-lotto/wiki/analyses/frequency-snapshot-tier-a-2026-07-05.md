---
type: analysis
title: "빈도 스냅샷 Tier A 2026-07-05"
description: "1230회 기준 보너스 포함 전체·최근30회 번호 빈도"
tags: [analysis, frequency, snapshot, tier-a]
created: 2026-07-05
updated: 2026-07-05
sources:
  - data/lotto-draws.json
---

# 빈도 스냅샷 Tier A (2026-07-05)

> **Tier A (보너스 포함)** — LottoZavis 앱 `data/lotto-draws.json`과 동일 집계. `frequencyIncludesBonus: true` — [[POLICY]]

앱 캐시 **1~1230회** 기준 (`lastUpdated`: 2026-07-03T12:24:10.107Z). 재계산: `python scripts/compute_tier_a_from_app_cache.py`

## 전체 빈도 (1230회, 8610볼)

- 기대 출현 횟수/번호: **191.33** (1230×7÷45)
- 실제 범위: **162 ~ 212** (차이 50회)

### TOP 10

| 순위 | 번호 | 횟수 | 이격(기대 대비) |
|------|------|------|----------------|
| 1 | 27 | 212 | +20.7 |
| 2 | 34 | 208 | +16.7 |
| 3 | 33 | 206 | +14.7 |
| 4 | 13 | 206 | +14.7 |
| 5 | 12 | 205 | +13.7 |
| 6 | 17 | 204 | +12.7 |
| 7 | 3 | 203 | +11.7 |
| 8 | 1 | 202 | +10.7 |
| 9 | 7 | 200 | +8.7 |
| 10 | 31 | 199 | +7.7 |

### BOTTOM 5

| 순위 | 번호 | 횟수 | 이격(기대 대비) |
|------|------|------|----------------|
| 1 | 9 | 162 | -29.3 |
| 2 | 22 | 164 | -27.3 |
| 3 | 23 | 168 | -23.3 |
| 4 | 41 | 169 | -22.3 |
| 5 | 29 | 172 | -19.3 |

## 최근 30회 (1201~1230)

기대값: 30×7÷45 = **4.67회/번호**

| 순위 | 번호 | 횟수 |
|------|------|------|
| 1 | 27 | 10 |
| 2 | 28, 31 | 8 |
| 3 | 31, 41, 45, 25 | 8 |

- 30회 내 **미출현 번호 없음** — [[concepts/frequency-deviation]] 30게임 분기점과 일치

## cryingbird 이론과 대조

1. **대수의 법칙**: 1230회 Tier A에서도 번호별 빈도는 162~212로 완전 균등하지 않음.
2. **베르누이**: 위 빈도는 과거 기록이며, 1231회 각 번호 확률은 여전히 1/45.
3. **빈도 행보**: → [[analyses/freq-trend-tier-a-2026-07-05]]

## Legacy 참고

- Tier B (메인 6볼) 역사 스냅샷: [[analyses/frequency-snapshot-2026-07-05]] (로컬 CSV 1231회 ingest)

## 관련

- [[sources/dhlottery-official-draws]]
- [[concepts/frequency-deviation]]
- [[concepts/bernoulli-and-lln]]
- [[entities/draws/draw-1230]]
- [[analyses/freq-trend-tier-a-2026-07-05]]
