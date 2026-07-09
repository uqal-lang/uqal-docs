---
id: changelog
title: Changelog
sidebar_position: 7
---

# Changelog

All notable changes to UQAL are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] — Initial Release

### Added

- Core UQAL language: `let`, arithmetic, `get_table`, `get_row`, `get_value`, `get`
- Write operations: `insert_row`, `update`, `delete`
- Table management: `insert_table`, `create_view` with auto-aliasing and `AS`
- Cross-table query blocks: `db.query: let … return …`
- Control flow: `if / elif / else`, `for`, `while`, `output`
- Schema commands: `sync_schema`, `list_tables`, `list dbs`, `list modules`
- Output formats: `table`, `json`, `csv` with `| pipe` override in REPL
- `standard.postgresql` module — full read/write/DDL support
- `standard.mongodb` module — read/write, strict and flexible schema discovery
- `standard.neo4j` module — node queries and graph relationship traversal syntax
- Grammar extension system with `GrammarBuilder` and extension points
- Module Node Registry for custom AST node handlers
- Native query escape hatch: `db.sql()`, `db.mongo()`, `db.cypher()`
- Security validators for all three modules
- CLI: `run`, `start` (REPL), `add-connection`, `update-connection`,
  `remove-connection`, `list-connections`, `test-connection`
- CLI: `list-modules`, `add-module`
- CLI: `cache status`, `cache clear`, `cache drop-schema`
- CLI: `script list`, `script show`, `script run`, `script edit`,
  `script rename`, `script delete`
- Schema caching with configurable TTL
- Module compliance test suite
