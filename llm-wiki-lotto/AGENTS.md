# LLM Wiki — 로또 분석 위키

Karpathy [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 패턴을 로또 분석 도메인에 적용한 스키마입니다.
이 파일은 LLM 에이전트가 위키를 유지보수할 때 따를 규칙과 워크플로를 정의합니다.

## 역할 분담

- **사용자**: 원본 자료 수집, 분석 방향 지시, 질문, 결과 검토
- **LLM**: 소스 흡수, 페이지 작성·갱신, 교차 참조, 인덱스·로그 유지, Lint

## 디렉터리 구조

```
llm-wiki-lotto/
├── AGENTS.md          ← 이 파일 (스키마)
├── raw/               ← 원본 자료 (읽기 전용, LLM이 수정 금지)
│   └── assets/        ← 이미지·첨부 파일
└── wiki/              ← LLM이 생성·유지하는 위키
    ├── POLICY.md      ← 통계·톤·저장소 정책 (Phase 0, 앱 정렬)
    ├── index.md       ← 전체 페이지 카탈로그
    ├── log.md         ← 시간순 작업 기록
    ├── overview.md    ← 전체 종합·현재 결론
    ├── sources/       ← 원본별 요약 페이지
    ├── entities/      ← 구체적 대상 (회차, 번호, 패턴)
    ├── concepts/      ← 개념·이론·전략
    └── analyses/      ← 질의 결과로 생성된 분석 페이지
```

## 페이지 유형과 규칙

### 공통 frontmatter (모든 위키 페이지)

```yaml
---
type: source | entity | concept | analysis | overview
title: "페이지 제목"
description: "한 줄 요약"
tags: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []          # raw/ 내 원본 파일 경로 목록
---
```

### `sources/` — 원본 요약

- 파일명: `sources/{slug}.md` (예: `sources/dhlottery-api-docs.md`)
- 원본 1개당 요약 페이지 1개
- 핵심 수치·주장은 반드시 원본 경로와 함께 인용

### `entities/` — 구체적 대상

- `entities/draws/` — 회차별 당첨 결과 (예: `draw-1150.md`)
- `entities/numbers/` — 번호별 통계 (예: `number-07.md`)
- `entities/patterns/` — 관찰된 패턴 (예: `consecutive-pairs.md`)
- 새 엔티티는 다른 페이지에서 `[[wikilink]]`로 참조될 때 생성

### `concepts/` — 개념·이론

- 확률, 조합 수, 핫/콜드 번호, 휠링, 필터 전략 등
- 여러 소스에서 반복 등장하는 아이디어를 종합

### `analyses/` — 질의 결과 보관

- 사용자 질문에 대한 답변 중 위키에 남길 가치가 있는 것
- 파일명: `analyses/{slug}-{YYYY-MM-DD}.md`

### `overview.md`

- 위키 전체의 현재 결론·테제
- 새 소스 흡수 후 반드시 검토·갱신 여부 판단

## 워크플로

각 워크플로는 `.cursor/skills/`에 스킬로 등록되어 있다. 해당 작업 시 스킬을 읽고 따른다.

| 작업 | 스킬 | 트리거 예시 |
|------|------|-------------|
| Ingest | `wiki-ingest` | "raw/xxx.csv ingest 해줘", "소스 흡수" |
| Query | `wiki-query` | "가장 많이 나온 번호는?", "위키 질의" |
| Lint | `wiki-lint` | "위키 lint 해줘", "건강 점검" |
| Tier A refresh | (스크립트) | 앱 캐시 갱신 후 `compute_tier_a_from_app_cache.py` → `generate_tier_a_wiki_pages.py` |

### Ingest (소스 흡수)

→ `.cursor/skills/wiki-ingest/SKILL.md` 참조

### Query (질의)

→ `.cursor/skills/wiki-query/SKILL.md` 참조

### Lint (건강 점검)

→ `.cursor/skills/wiki-lint/SKILL.md` 참조

## index.md 형식

카테고리별로 페이지를 나열한다.

```markdown
## Sources
- [[sources/example]] — 한 줄 요약 (sources: 1)

## Entities
### Draws
- [[entities/draws/draw-1150]] — 1150회 당첨 결과

## Concepts
- [[concepts/probability-basics]] — 로또 당첨 확률 기초
```

## log.md 형식

append-only. 항목 접두사를 일관되게 유지한다.

```markdown
## [2026-07-05] init | 위키 초기 구조 생성
## [2026-07-05] ingest | {원본 제목}
## [2026-07-05] query | {질문 요약}
## [2026-07-05] lint | 정기 점검
```

## 링크 규칙

- Obsidian wikilink: `[[경로/파일명]]` (확장자 생략)
- 원본 인용: `` `raw/파일명` `` 백틱으로 경로 표기
- 회차 참조: `[[entities/draws/draw-{회차}]]`
- 번호 참조: `[[entities/numbers/number-{두자리}]]` (예: `number-07`)

## 금지 사항

- `raw/` 내 파일 생성·수정·삭제 금지 (사용자만 관리)
- 근거 없는 통계·당첨 번호 예측을 사실처럼 기록 금지
- Lint에서 사용자 승인 없이 페이지 삭제 금지
- 환각으로 위키 페이지 생성 금지 — 반드시 `raw/` 소스 또는 사용자 제공 데이터에 근거

## 도메인 맥락

- 대상: 대한민국 로또 6/45 (1~45 중 6개 + 보너스 1개)
- 위키 목적: 당첨 데이터·통계·전략·자료를 구조화하여 누적 학습
- 로또는 확률 게임임을 전제로, "확실한 당첨법"류 주장은 비판적으로 기록
