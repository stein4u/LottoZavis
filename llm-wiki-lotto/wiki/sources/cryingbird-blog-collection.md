---
type: source
title: "cryingbird 로또 블로그 컬렉션"
description: "네이버 블로그 chkkkkk 재테크/로또 카테고리 79편 일괄 흡수"
tags: [source, cryingbird, naver-blog]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/README.md
  - raw/lotto/manifest.json
---

# cryingbird 로또 블로그 컬렉션

## 출처

- 블로그: [blog.naver.com/chkkkkk](https://blog.naver.com/chkkkkk) (재테크/로또, categoryNo=73)
- 저자: **cryingbird** (금융·보험 전문가, 로또조또 개발자)
- 기간: 2014.11 ~ 2016.9
- 원본 폴더: `raw/lotto/` (마크다운 79편 + `manifest.json`)

## 카테고리 분류

| 분류 | 편수 | 위키 요약 |
|------|------|-----------|
| [[sources/lottojotto-tool]] | 7 | 로또조또 프로그램·확률 통계론 |
| [[sources/chapter-a-foundation]] | 4 | 챕터 A + 확률 기초 |
| [[sources/analysis-stories-series]] | 37 | 로또 분석 이야기 1~37 |
| [[sources/per-draw-predictions]] | 18 | 회차별 예상·분석·복기 |
| [[sources/lotto-bible-misc]] | 13 | 바이블, 공지, 기타 |

## 핵심 takeaway

1. **이론 기반**: 로또는 [[concepts/bernoulli-and-lln|베르누이 시행]]이며 장기적으로 [[concepts/bernoulli-and-lln|대수의 법칙]]을 따른다. 단기적으로는 [[concepts/frequency-deviation|빈도 이격]]이 발생한다.
2. **분석 방향**: 개별 번호가 아닌 **조합** 단위 분석. [[concepts/combination-over-numbers|수가 아닌 조합을 취하라]].
3. **핵심 도구 개념**: [[concepts/exclusion-numbers|제외수]], [[concepts/filtering|필터링]], [[concepts/frequency-trend|빈도 행보]], [[concepts/basic-stat-filters|기본 통계 필터]].
4. **도구**: [[concepts/lottojotto|로또조또]] — 확률·통계 기반 조합 추출·분석 프로그램.
5. **종합**: [[analyses/wiki-synthesis-2026-07-05]] — 방법론 + 1231회 실데이터 결론
5. **비판적 시각**: 선형·회귀 분석 비판, 번호 제공업체 비판, "확실한 당첨법" 경계. 로또는 확률 게임임을 전제.

## 저작권·이용

원문에 비영리 목적 작성·사업적 영리 이용 금지 명시 (`raw/lotto/220359449998_650회차-기준-숫자별-빈도행보.md` 등).

## 하위 소스 인덱스

- [[sources/lottojotto-tool]]
- [[sources/chapter-a-foundation]]
- [[sources/analysis-stories-series]]
- [[sources/per-draw-predictions]]
- [[sources/lotto-bible-misc]]
