---
id: getting-started
title: Getting Started
sidebar_position: 2
---

# Getting Started

## Installation

UQAL is a Python package managed with `uv`.

```bash
git clone https://github.com/uqal/uqal
cd uqal/uqal-core
uv sync
```

After `uv sync`, the `uqal` command is available in your terminal.

## Add a Connection

Register a database connection. UQAL supports interactive setup (prompts you
for each field) or flag-based setup (for scripting or CI):

```bash
# Interactive — prompts for host, port, database, credentials
uqal add-connection mydb standard.postgresql

# Non-interactive — all values via flags
uqal add-connection mydb standard.postgresql \
    --host localhost \
    --port 5432 \
    --database mydb \
    --secret user myuser \
    --secret password mypassword \
    --no-interactive
```

This creates two files:

| File              | Contents                                      | Committed? |
|-------------------|-----------------------------------------------|------------|
| `uqal_config.json` | Host, port, database name, module name       | Yes        |
| `.env`             | Secrets (user, password)                     | **No** — auto-added to `.gitignore` |

## Load the Schema

Before querying, UQAL needs to know your database structure:

```bash
uqal run "mydb.sync_schema"
```

UQAL caches the schema locally. It re-syncs automatically when the cache
expires (default: 24 hours). You only need to trigger it manually after
you change your database structure.

## Run Your First Query

```bash
uqal run "mydb.users.get_table(where active = true, fields id, name, email)"
```

## Start the REPL

For exploratory work, the interactive REPL is faster:

```bash
uqal start
```

```
uqal > mydb.list_tables
uqal > mydb.users.get_table(where active = true, fields id, name, email)
uqal > mydb.users.get_row(where id = 42)
```

The REPL supports multi-line scripts, output format switching, and history.
See [CLI Reference](./cli.md) for details.

## Next Steps

- [Language Reference](./language-reference.md) — complete syntax guide
- [CLI Reference](./cli.md) — all `uqal` commands
- Module guides: [PostgreSQL](./modules/postgresql.md) · [MongoDB](./modules/mongodb.md) · [Neo4j](./modules/neo4j.md)
