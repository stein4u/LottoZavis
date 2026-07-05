---
type: concept
title: "로또조또"
description: "cryingbird의 로또 분석·조합 추출 프로그램"
tags: [concept, tool, lottojotto]
created: 2026-07-05
updated: 2026-07-05
sources:
  - raw/lotto/220184385504_로또분석전용프로그램-로또조또의-개발.md
---

# 로또조또

## 개요

**로또번호추출분석기**. cryingbird 개발. 2014년 공개.

출처: `raw/lotto/220184385504_로또분석전용프로그램-로또조또의-개발.md`

## 기능

- 확률·통계 기반 **조합 추출**
- [[concepts/basic-stat-filters|기본 통계 필터]] 적용
- **분석 점수** 산출 (`220187231115`)
- [[concepts/filtering|필터링]] — 500조합 표본
- **자동분석** 모드 (`220317577356`)
- 랜덤 추출 (조건 없이 = 순수 랜덤)

## 이론 기반

[[concepts/bernoulli-and-lln|베르누이·대수의 법칙]] + [[concepts/frequency-deviation|빈도 이격]] + 정규분포 이격도

→ [[sources/lottojotto-tool]], [[sources/chapter-a-foundation]]

## 문서

- 사용법, Q&A, 공지: [[sources/lottojotto-tool]]

## 위키 관점

방법론의 **구현체**. 프로그램 없이도 개념(제외수, 필터링, 빈도 행보)은 독립적으로 학습 가능.
