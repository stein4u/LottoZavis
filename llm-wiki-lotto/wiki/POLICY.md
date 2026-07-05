---
type: overview
title: "위키 정책 — 통계·톤·저장소"
description: "LottoZavis 앱과 정렬하는 canonical 규칙 (Phase 0)"
tags: [meta, policy]
created: 2026-07-05
updated: 2026-07-05
sources:
  - openspec/specs/lotto-stats/spec.md
---

# 위키 정책 (Phase 0)

LottoZavis 앱(`data/lotto-draws.json`, `GET /api/lotto-stats`)과 위키가 **같은 규칙**으로 숫자·서술을 읽도록 고정한다.

## 1. Git 저장소 범위

| 포함 (버전 관리) | 제외 (로컬·`.gitignore`) |
|------------------|---------------------------|
| `llm-wiki-lotto/AGENTS.md` | `llm-wiki-lotto/raw/` |
| `llm-wiki-lotto/wiki/**` | `llm-wiki-lotto/scripts/` |
| | `llm-wiki-lotto/.cursor/` |
| | `llm-wiki-lotto/.obsidian/` |

- 위키 페이지의 `sources:` frontmatter는 `raw/...` **경로 참조만** 유지한다.
- ingest·재계산은 로컬 `raw/` + 스크립트로 수행하고, **갱신 결과는 `wiki/`만 커밋**한다.

## 2. Canonical 데이터

| 계층 | 소스 | 용도 |
|------|------|------|
| **앱 runtime** | `data/lotto-draws.json` | Analysis, Predictor, API |
| **위키 수치 (향후)** | 앱 캐시와 동일 회차·동일 정책 | analyses, concepts 실측 |
| **raw CSV/JSON** | 로컬 전용 | ingest 입력; repo에 커밋하지 않음 |

앱과 위키의 **최신 회차·당첨번호**는 항상 동일해야 한다. 불일치 시 앱 캐시를 기준으로 wiki analyses를 갱신한다.

**Phase 0.5 (2026-07-05)**: Tier A canonical pages — `analyses/frequency-snapshot-tier-a-2026-07-05`, `analyses/freq-trend-tier-a-2026-07-05`. 재생성: `python scripts/compute_tier_a_from_app_cache.py && python scripts/generate_tier_a_wiki_pages.py`

## 3. 통계 집계 — 용도별 Tier

매 회차: **main 6 + bonus 1**.

```
┌─────────────────────────────────────────────────────────┐
│  Tier A — 보너스 포함 (7볼 이벤트)                        │
│  라벨: "보너스 포함" / frequencyIncludesBonus: true      │
├─────────────────────────────────────────────────────────┤
│  • 번호 빈도 (frequency)                                 │
│  • 미출현 (absence)                                      │
│  • 구간 (zone 1–15 / 16–30 / 31–45)                      │
│  • 동반 출현 (co-occurrence, 21 pairs/회)                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Tier B — 메인 6개만                                     │
│  라벨: "메인 6개만"                                      │
├─────────────────────────────────────────────────────────┤
│  • 홀짝 비율                                             │
│  • 합계 구간 (sum range)                                 │
│  • 연속 번호 포함 회차                                   │
│  • cryingbird 원문·역사적 예시 (651회 등) — 출처 명시     │
└─────────────────────────────────────────────────────────┘
```

### 기대값 공식

| Tier | window = N 회 | 기대 출현/번호 |
|------|----------------|----------------|
| **A** (보너스 포함) | N | `N × 7 ÷ 45` |
| **B** (메인 6) | N | `N × 6 ÷ 45` |

**예:** 1231회 Tier A 기대 ≈ **191.4** / Tier B 기대 ≈ **164.1**

위키·앱 표·문장에 수치를 쓸 때 **Tier를 반드시 라벨**한다. Tier 혼용 금지.

### Legacy (Tier B) 페이지

2026-07-05 이전 ingest로 생성된 아래 페이지는 **메인 6볼만** 집계했다. canonical Tier A는 `analyses/*-tier-a-*` — [[analyses/frequency-snapshot-tier-a-2026-07-05]].

- [[analyses/frequency-snapshot-2026-07-05]] (Tier B)
- [[analyses/freq-trend-2026-07-05]] (Tier B)
- [[sources/dhlottery-official-draws]] (스냅샷 표 일부 Tier B)

## 4. 서술 톤 (Wiki = LottoZavis 공식)

### 한다

- 로또는 **확률 게임**; 1등 확률 **1/8,145,060**은 변하지 않음
- cryingbird 방법론 = **조합 공간 축소·필터링** 프레임
- 주장·수치마다 **출처** (`sources:`, 회차, raw 경로)
- 2014–2016 회차 예측 글 = **사후 검증 없음** (역사적 참고)
- LottoZavis Predictor = **실데이터 빈도 기반 가중 추천** (`weighted-random`), 당첨 보장 없음

### 하지 않는다

- "LSTM/RF/XGBoost **학습**으로 당첨 확률 상승"
- precision / recall / F1 / confidence **등 ML 평가 지표**를 사실처럼 제시
- "확실한 당첨법", "다음 회차 **반드시** 나온다"
- 근거 없는 통계·예측을 사실처럼 기록 (`AGENTS.md` 금지 사항과 동일)

### 앱 WikiTab (Phase 1) ✓

앱 WikiTab은 `GET /api/wiki/pages`·`/api/wiki/page`로 `wiki/` markdown을 표시한다. `preseededArticles`(ML 파이프라인 서술)는 **deprecated**.

## 5. 위키 ↔ 앱 탭 매핑 (참고)

| 앱 | 위키 연결 |
|----|-----------|
| Analysis — 빈도·미출현·구간 | Tier A, [[concepts/frequency-deviation]] |
| Analysis — 홀짝·합계 | Tier B |
| Analysis — co-occurrence | Tier A, [[concepts/clustering-dispersion]] |
| Predictor | [[concepts/filtering]], [[concepts/exclusion-numbers]] (ML 아님) |
| Wiki Q&A (Phase 2) | [[overview]], [[index]] + RAG |

## 관련

- [[overview]] — 위키 종합
- [[index]] — 페이지 카탈로그
- `openspec/specs/lotto-stats/spec.md` — 앱 stats 스펙
