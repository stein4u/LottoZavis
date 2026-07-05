---
type: overview
title: "위키 로그"
description: "위키 작업의 시간순 기록"
tags: [meta, log]
created: 2026-07-05
updated: 2026-07-05
sources: []
---

# 위키 로그

append-only. 최신 항목이 아래에 추가됩니다.

## [2026-07-05] init | 위키 초기 구조 생성

- `AGENTS.md` 스키마 작성
- `raw/`, `wiki/` 디렉터리 및 하위 폴더 생성
- `index.md`, `overview.md`, `log.md` 초기화

## [2026-07-05] init | 워크플로 스킬 등록

- `.cursor/skills/wiki-ingest/SKILL.md`
- `.cursor/skills/wiki-query/SKILL.md`
- `.cursor/skills/wiki-lint/SKILL.md`

## [2026-07-05] ingest | raw/lotto cryingbird 블로그 79편

- 소스: `raw/lotto/` 마크다운 79편 + manifest
- 생성: sources 6, concepts 9, entities/patterns 1
- 갱신: index.md, overview.md

## [2026-07-05] lint | 정기 점검

- 리포트: 채팅 응답 (19페이지 대상)
- 종합: 🟡 Yellow — 구조 양호, 데이터·긴장 관계 보완 필요

## [2026-07-05] ingest | 동행복권 당첨 CSV (1~1231회)

- raw: `lotto-draws.csv`, `lotto-draws.meta.json`, `lotto-draws.stats.json`
- API: lt645/selectPstLt645Info.do (구 getLottoNumber API 대체)
- 생성: sources/dhlottery-official-draws, entities/draws/draw-1231, analyses/frequency-snapshot-2026-07-05
- 갱신: index.md, overview.md, concepts/frequency-trend.md

## [2026-07-05] ingest | lint 후속 보완

- 모순 콜아웃: analysis-stories-series 4·29화, exclusion-numbers 조건부 확률
- 교차 참조 7건 보강
- concepts 3개: clustering-dispersion, limit-deviation, reappearance-gap
- analyses/wiki-synthesis-2026-07-05 생성
- 갱신: index.md, overview.md, chapter-a-foundation, frequency-deviation, basic-stat-filters, combination-over-numbers, single-decade-extreme

## [2026-07-05] query | 30게임 빈도 행보 재계산

- 스크립트: `scripts/compute_freq_trend.py`
- raw: `lotto-freq-trend.json` (45번호 × 120게임, 1112~1231회)
- 생성: analyses/freq-trend-2026-07-05
- 갱신: concepts/frequency-trend, sources/dhlottery-official-draws, index.md, overview.md

## [2026-07-05] lint | 정기 점검

- 리포트: 채팅 응답 (27페이지 대상)
- 종합: 🟡 Yellow — 구조 양호, freq-trend 이후 일부 페이지 내용 미동기화

## [2026-07-05] lint | 후속 교차 참조·동기화

- 갱신: analyses/frequency-snapshot, analyses/wiki-synthesis, sources/dhlottery-official-draws, sources/per-draw-predictions
- 갱신: entities/draws/draw-1231, concepts/frequency-deviation, concepts/exclusion-numbers, concepts/clustering-dispersion, analyses/freq-trend
- 갱신: sources/cryingbird-blog-collection (wiki-synthesis inbound)

## [2026-07-05] policy | Phase 0 — Tier·톤·git 정책

- 생성: [[POLICY]] (Tier A/B, canonical data, wiki-only commit)
- drift 콜아웃: analyses/frequency-snapshot, analyses/freq-trend, sources/dhlottery-official-draws, concepts/frequency-deviation, analyses/wiki-synthesis
- 갱신: index.md, overview.md
- repo: `.gitignore` — raw/scripts/.cursor/.obsidian 제외
