---
id: index
title: Database Modules
sidebar_label: Overview
sidebar_position: 1
---

# Database Modules

Each database is supported by a UQAL module. Modules handle translation,
schema discovery, type mapping, and native query validation.

## Concept Mapping

The same UQAL concepts map to different database terms:

| UQAL Concept  | PostgreSQL     | MongoDB        | Neo4j              |
|---------------|----------------|----------------|--------------------|
| Table         | Table / View   | Collection     | Node Label         |
| Row           | Row            | Document       | Node               |
| Field         | Column         | Field          | Property           |
| `get_table`   | `SELECT`       | `find()`       | `MATCH … RETURN`   |
| `get_row`     | `SELECT … LIMIT 1` | `findOne()` | `MATCH … LIMIT 1` |
| `get_value`   | `SELECT field … LIMIT 1` | field projection | property LIMIT 1 |
| `insert_row`  | `INSERT INTO`  | `insertOne()`  | `CREATE (n:Label)` |
| `update`      | `UPDATE`       | `updateOne()`  | `MATCH … SET`      |
| `delete`      | `DELETE`       | `deleteOne()`  | `MATCH … DELETE`   |
| `create_view` | `CREATE VIEW`  | (aggregation)  | Not supported      |
| Native escape | `db.sql()`     | `db.mongo()`   | `db.cypher()`      |

## Built-in Modules

| Module                | Database    | Status   |
|-----------------------|-------------|----------|
| `standard.postgresql` | PostgreSQL 12+ | Stable |
| `standard.mongodb`    | MongoDB 5+  | Stable   |
| `standard.neo4j`      | Neo4j 5+    | Stable   |

## Community Modules

Community modules follow the `community.*` naming convention. Install them
with `uqal add-module`. See
[Extension Modules](../contributing/extension-modules.md) for how to build one.
