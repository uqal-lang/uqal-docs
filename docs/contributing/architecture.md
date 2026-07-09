---
id: architecture
title: Architecture
sidebar_position: 2
---

# Architecture

UQAL is built around one core principle: **the core knows nothing about
databases.** Every database-specific detail lives in a module. The core
provides the language, the grammar, the type system, and the execution
model — and explicitly exposes extension points so modules can plug in.

## Pipeline

A UQAL script flows through five stages:

```
  Script (text)
       │
       ▼
  ┌─────────┐
  │  Parser  │  Lark earley grammar → parse tree
  └─────────┘
       │
       ▼
  ┌─────────────┐
  │ Transformer │  parse tree → AST (Python dataclasses)
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │ TypeChecker │  validates table names, field names, types
  └─────────────┘
       │
       ▼
  ┌─────────┐
  │ Planner │  AST → execution plan (ordered steps with dependencies)
  └─────────┘
       │
       ▼
  ┌──────────┐
  │ Executor │  runs each step, calls module.translate() + module.execute()
  └──────────┘
```

## Grammar Assembly

The base grammar defines UQAL's core syntax and three extension points —
placeholder rules that match nothing by default:

```
module_table_command:      /(?!)/   # new commands on db.table.X()
module_connection_command: /(?!)/   # new commands on db.X()
module_condition:          /(?!)/   # new condition expressions
module_param:              /(?!)/   # new parameter types
```

At startup, `GrammarBuilder` collects grammar extensions from all loaded
modules and replaces the placeholders:

```python
parser = GrammarBuilder().build([postgresql_module, neo4j_module])
```

Each module provides a `grammar_extension.lark` file and declares which
extension points it contributes to via `get_capabilities()`. Two modules
can both contribute to `module_condition` — their alternatives are merged
with `|`.

**Example:** Neo4j adds relationship traversal to the condition rule:

```lark
# grammar_extension.lark (neo4j)
neo4j_rel_traversal: NAME NAME NAME
                   | NAME NAME "[" NAME ("," NAME)* "]" NAME
```

```python
# capabilities.py (neo4j)
grammar_extensions = {
    "condition": ["neo4j_rel_traversal"],
}
```

After `GrammarBuilder.build()`, the grammar contains:
```lark
module_condition: neo4j_rel_traversal
```

## Module Node Registry

When a grammar rule produces an AST node that the core transformer does
not know about, the module registers a handler:

```python
# module.py (neo4j) — runs at class-definition time (import time)
def _handle_neo4j_rel_traversal(children: list) -> RelationshipTraversal:
    ...

register_node_handler("neo4j_rel_traversal", _handle_neo4j_rel_traversal)
```

The transformer's `__default__` method looks up the rule name in the
registry and calls the handler if one exists. If no handler is registered,
the node passes through as a raw tree node.

**When do you need this?** Whenever your grammar extension produces a
structured AST node (like `RelationshipTraversal`) rather than a plain
string. If your grammar extension maps cleanly to an existing core node
type or just produces a string value, you don't need a registry entry.

## Execution Model

The planner converts the AST into a flat list of `Step` objects. Each
step has a `StepKind`, a reference to the relevant AST node, and a
dependency list (other steps that must complete first).

| StepKind  | Triggered by                     | Executor action                    |
|-----------|----------------------------------|------------------------------------|
| `COMPUTE` | `let x = arithmetic_expr`        | Evaluates expression locally       |
| `DB_READ` | `let x = db.table.get_*(…)`      | `module.translate()` + `module.execute()` |
| `DB_WRITE`| `db.table.insert_row(…)` etc.    | `module.translate()` + `module.execute()` |
| `DDL`     | `db.create_view` / `insert_table`| `module.create_view()` / DDL exec  |
| `NATIVE`  | `db.sql()` / `db.cypher()` etc.  | `module.execute_native()`          |
| `OUTPUT`  | `output expr`                    | Formats result, writes to output target |
| `CONTROL` | `if` / `for` / `while`           | Evaluates condition, branches      |

The executor runs steps in dependency order. If a step fails, dependent
steps are skipped. Independent steps could theoretically run in parallel
(not yet implemented).

## Schema Cache

`sync_schema` loads the database structure into a `SchemaStore` and caches
it locally (default TTL: 24 hours). The `TypeChecker` reads from the cache
to validate table and field names before execution.

If the cache is empty or expired, UQAL triggers a sync automatically on
first use. You can also trigger it manually with `uqal run "db.sync_schema"`.

## Key Interfaces

The `UQALModule` abstract class is the contract between the core and a
module. Methods are grouped by responsibility:

| Group        | Methods                                                          |
|--------------|------------------------------------------------------------------|
| Identity     | `get_manifest()`, `get_capabilities()`, `get_grammar_extension()` |
| Connection   | `build_connection()`, `get_connection_schema()`                  |
| Translation  | `translate()`, `get_type_mapping()`                              |
| Execution    | `execute()`, `execute_native()`, `validate_native_query()`        |
| Schema       | `get_schema_store()`, `sync_schema_from_source()`, `create_view()` |
