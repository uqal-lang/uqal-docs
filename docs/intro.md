---
id: intro
title: What is UQAL?
sidebar_label: What is UQAL?
sidebar_position: 1
---

# What is UQAL?

UQAL (Universal Query Abstraction Language) is a database-agnostic query language
with a plugin architecture. You write one query syntax — UQAL translates it to
whatever your database actually speaks.

## The Problem

Every database has its own query language:

| Database   | Language          | Example                                        |
|------------|-------------------|------------------------------------------------|
| PostgreSQL | SQL               | `SELECT id, name FROM orders WHERE active = true` |
| MongoDB    | Query Language    | `db.orders.find({active: true}, {id:1, name:1})` |
| Neo4j      | Cypher            | `MATCH (n:orders) WHERE n.active = true RETURN n.id, n.name` |

If you work with multiple databases, you learn multiple languages. If you want
to switch databases, you rewrite every query.

## The UQAL Answer

One syntax that translates to all of them:

```
mydb.orders.get_table(where active = true, fields id, name)
```

Whether `mydb` is PostgreSQL, MongoDB, or Neo4j — the syntax stays exactly
the same. What differs is what the module does with it internally.

## What UQAL is NOT

- **Not an ORM.** There are no models, no object mapping, no migrations.
  UQAL works directly with your existing database structure.
- **Not a replacement for native queries.** When you need something
  database-specific, UQAL has a native escape hatch: `db.sql()`, `db.mongo()`,
  `db.cypher()`. Use the abstraction where it helps; go native where it doesn't.
- **Not magic.** You always know which database you are talking to.
  `db1` is declared in your config with an explicit module (`standard.postgresql`,
  `standard.mongodb`, etc.). Nothing is implicit.

## The Three Layers

```
┌─────────────────────────────────────────┐
│  Core Syntax                            │
│  let, where, get_table, if, for, ...    │  ← works identically everywhere
├─────────────────────────────────────────┤
│  Module Mapping                         │
│  Table → Collection → Node Label        │  ← same syntax, different translation
├─────────────────────────────────────────┤
│  Native Escape Hatch                    │
│  db.sql()  db.mongo()  db.cypher()      │  ← direct access with security check
└─────────────────────────────────────────┘
```

## Two Ways to Use This Documentation

**You want to use UQAL as a tool** — query databases, write scripts, use the
REPL. Start with [Getting Started](./getting-started.md).

**You want to extend UQAL** — build a new database module, contribute to
the core, understand how the grammar and executor work. Start with
[Architecture](./contributing/architecture.md).
