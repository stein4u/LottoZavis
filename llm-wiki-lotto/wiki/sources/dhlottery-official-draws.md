---
type: source
title: "동행복권 공식 당첨 데이터"
description: "lt645 API 전 회차(1~1231) 당첨 번호 CSV"
tags: [source, dhlottery, official-data]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto-draws.csv
  - raw/lotto-draws.meta.json
  - raw/lotto-draws.stats.json
---

# 동행복권 공식 당첨 데이터

## 원본

| 파일 | 설명 |
|------|------|
| `raw/lotto-draws.csv` | 1~1231회 전체 당첨 번호 |
| `raw/lotto-draws.meta.json` | API 메타·수집일 |
| `raw/lotto-draws.stats.json` | 파생 통계 (빈도 등) |
| `raw/lotto-freq-trend.json` | 30게임 빈도 행보 시계열 (1112~1231회) |

- 수집일: **2026-07-05**
- 최신 회차: **1231회** (2026-07-04)
- 총 **1231회** (2002-12-07 ~ 2026-07-04)

## API (2026년 기준)

사용자가 제시한 구 API는 현재 HTML을 반환합니다. 아래 **신규 API**를 사용합니다.

```
GET https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do
  ?srchLtEpsd=all          # 전체 회차 (또는 특정 회차 번호)
  &_={timestamp}

필수 헤더:
  X-Requested-With: XMLHttpRequest
  Referer: https://www.dhlottery.co.kr/
```

구 API (참고, 현재 비JSON 응답):

```
GET https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={회차}
```

수집 스크립트: `scripts/fetch_lotto_draws.py`

## CSV 컬럼

| 컬럼 | 설명 |
|------|------|
| drwNo | 회차 |
| drwNoDate | 추첨일 (YYYY-MM-DD) |
| drwtNo1~6 | 당첨 번호 6개 |
| bnusNo | 보너스 번호 |
| totSellamnt | 해당 회차 판매액 |
| firstWinamnt | 1등 1인당 당첨금 |
| firstPrzwnerCo | 1등 당첨자 수 |

## 스냅샷 통계 (1231회 기준)

출처: `raw/lotto-draws.stats.json`

### 최신 회차

- **1231회** (2026-07-04): `4, 13, 14, 18, 31, 38` + 보너스 `15`
- → [[entities/draws/draw-1231]]

### 전체 빈도 (기대값 164.13회/번호)

> **Tier B legacy** — 메인 6볼만. Tier A canonical — [[POLICY]]

| 구분 | 번호 | 출현 횟수 |
|------|------|-----------|
| TOP 3 | 34, 27, 13 | 184, 181, 179 |
| BOTTOM 3 | 9, 32, 22 | 136, 144, 144 |
| 범위 | min~max | 136~184 |

→ [[concepts/bernoulli-and-lln|대수의 법칙]] 관점에서 장기 이격 존재. [[analyses/frequency-snapshot-2026-07-05]] 상세.

### 최근 30회 (1202~1231)

- 최다 출현: 27(8회), 28·31(7회)
- 30회 내 미출현 번호: **없음** (전 번호 1회 이상)

## cryingbird 데이터와의 관계

| 항목 | cryingbird (`raw/lotto/`) | 공식 CSV |
|------|---------------------------|----------|
| 기간 | 2014~2016 글·650회 스냅샷 | 1~1231회 전체 |
| 용도 | 방법론·이론 | **실제 당첨 기록** |
| 빈도 행보 | 650회 기준 수동 예시 | [[analyses/freq-trend-2026-07-05]] (1112~1231회 재계산) |

> [!warning] 데이터 시대 차이
> `concepts/frequency-trend`의 650회 예시는 역사적 참고용. 현행 행보는 `raw/lotto-freq-trend.json`·[[analyses/freq-trend-2026-07-05]] 기준.

## 관련

- [[analyses/frequency-snapshot-2026-07-05]]
- [[analyses/freq-trend-2026-07-05]]
- [[concepts/frequency-deviation]]
- [[sources/cryingbird-blog-collection]]
