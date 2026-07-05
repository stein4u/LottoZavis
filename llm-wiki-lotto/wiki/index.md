---
type: overview
title: "위키 인덱스"
description: "로또 분석 위키 전체 페이지 카탈로그"
tags: [meta, index]
created: 2026-07-05
updated: 2026-07-05
sources: []
---

# 위키 인덱스

## Overview

- [[overview]] — 위키 전체 종합·현재 결론
- [[POLICY]] — 통계 Tier·톤·git 저장소 정책 (Phase 0)

## Sources

- [[sources/cryingbird-blog-collection]] — cryingbird 블로그 79편 일괄 흡수 (sources: 79)
- [[sources/lottojotto-tool]] — 로또조또 도구 문서 7편
- [[sources/chapter-a-foundation]] — 챕터 A 확률 기초 4편
- [[sources/analysis-stories-series]] — 로또 분석 이야기 1~37
- [[sources/per-draw-predictions]] — 회차별 예상·분석·복기 18편
- [[sources/lotto-bible-misc]] — 바이블·공지·기타
- [[sources/dhlottery-official-draws]] — 동행복권 공식 당첨 (앱 캐시 1230회 + 로컬 CSV)

## Entities

### Draws (회차)

- [[entities/draws/draw-1230]] — 앱 캐시 최신 1230회 (2026-06-27)
- [[entities/draws/draw-1231]] — 로컬 CSV 1231회 (앱 캐시 미반영)
- 전체: [[sources/dhlottery-official-draws]] (`raw/lotto-draws.csv`)
- cryingbird 예측: [[sources/per-draw-predictions]]

### Numbers (번호)

_아직 없음 (조합 단위 분석 우선)_

### Patterns (패턴)

- [[entities/patterns/single-decade-extreme]] — 605회 단번대 5개 극단 사례

## Concepts

- [[concepts/bernoulli-and-lln]] — 베르누이 시행·대수의 법칙
- [[concepts/frequency-deviation]] — 빈도 이격
- [[concepts/frequency-trend]] — 빈도 행보
- [[concepts/exclusion-numbers]] — 제외수
- [[concepts/filtering]] — 필터링
- [[concepts/combination-over-numbers]] — 조합 분석 (수가 아닌 조합)
- [[concepts/basic-stat-filters]] — 홀짝·총합·전멸 등 기본 필터
- [[concepts/foreign-analysis-methods]] — 후나츠 사카이·게일 하워드·9궁도·포지션
- [[concepts/lottojotto]] — 로또조또 프로그램
- [[concepts/clustering-dispersion]] — 몰림·쏠림·분산
- [[concepts/limit-deviation]] — 한계 이격
- [[concepts/reappearance-gap]] — 재출현 간격 이격

## Analyses (분석)

### Tier A (canonical — 앱 `data/lotto-draws.json`)

- [[analyses/frequency-snapshot-tier-a-2026-07-05]] — 1230회 보너스 포함 빈도 스냅샷
- [[analyses/freq-trend-tier-a-2026-07-05]] — 30게임 Tier A freq30 행보
- [[analyses/wiki-synthesis-2026-07-05]] — 위키 종합 결론

### Tier B legacy (역사 스냅샷)

- [[analyses/frequency-snapshot-2026-07-05]] — 메인 6볼 only (로컬 CSV 1231회)
- [[analyses/freq-trend-2026-07-05]] — 메인 6볼 freq30 (로컬 CSV)
