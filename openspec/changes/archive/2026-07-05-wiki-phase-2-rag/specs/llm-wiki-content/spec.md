## ADDED Requirements

### Requirement: Wiki corpus retrieval for ask API

The system SHALL build a searchable index from `llm-wiki-lotto/wiki/` markdown (frontmatter + chunked body) and use it to retrieve context before answering `POST /api/wiki/ask`.

#### Scenario: Ask retrieves from wiki index

- **WHEN** a client posts a question to `/api/wiki/ask`
- **THEN** the server retrieves top-ranked wiki chunks from the on-disk corpus before calling the LLM

#### Scenario: Index reflects published wiki

- **WHEN** the server starts or detects updated wiki markdown mtime
- **THEN** the search index is rebuilt from current `llm-wiki-lotto/wiki/` files

### Requirement: Cited answers with wiki-query behavior

Answers SHALL follow agent `wiki-query` Step 2: synthesize only from retrieved wiki content, cite page ids, and apply POLICY tone rules.

#### Scenario: Answer includes citations

- **WHEN** retrieval finds relevant wiki chunks
- **THEN** the API response includes `citations` with `id`, `title`, and `excerpt` for each source page used

#### Scenario: Answer uses wikilink citations

- **WHEN** the LLM generates an answer
- **THEN** the answer markdown MAY include `[[page-id]]` links matching citation ids

#### Scenario: No hallucination on empty retrieval

- **WHEN** no wiki chunk meets the retrieval threshold
- **THEN** the response sets `coverage` to `none` and the answer states that the wiki lacks relevant content without inventing statistics

### Requirement: Tier A preference for stat questions

For questions about frequency, absence, zone, or co-occurrence metrics, retrieval SHALL prefer Tier A canonical pages over Tier B legacy pages.

#### Scenario: Frequency question prefers Tier A snapshot

- **WHEN** a user asks about all-time or recent number frequency
- **THEN** retrieved chunks prioritize `analyses/*-tier-a-*` and deprioritize pages with Tier B legacy callouts

### Requirement: POLICY always in ask context

`POST /api/wiki/ask` SHALL include `llm-wiki-lotto/wiki/POLICY.md` content (or equivalent summary) in the LLM context on every request.

#### Scenario: Policy informs tone

- **WHEN** any wiki ask request is processed
- **THEN** POLICY rules prohibiting ML win claims and requiring honest probability framing are present in the generation prompt

### Requirement: Agent maintenance boundary

Wiki content maintenance SHALL remain agent-driven via `wiki-ingest` and `wiki-lint` skills; the app ask endpoint SHALL NOT write to `wiki/analyses/` or `wiki/log.md`.

#### Scenario: Ask is read-only on wiki

- **WHEN** `/api/wiki/ask` completes successfully
- **THEN** no markdown files under `llm-wiki-lotto/wiki/` are created or modified by the request
