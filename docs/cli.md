---
id: cli
title: CLI Reference
sidebar_position: 4
---

# CLI Reference

All commands start with `uqal`. Run `uqal --help` for a summary at any time.

---

## `uqal run` — Execute a Query or Script

```bash
uqal run "<query>"
uqal run --file script.uqal
uqal run --file script.uqal --output json
uqal run --file script.uqal --module standard.postgresql
```

| Flag           | Description                                            |
|----------------|--------------------------------------------------------|
| `"<query>"`    | Inline UQAL expression or statement                    |
| `--file`       | Path to a `.uqal` script file                         |
| `--output`     | Output format: `table` (default), `json`, `csv`        |
| `--module`     | Force-load an additional module before running         |

---

## `uqal start` — Interactive REPL

```bash
uqal start
```

Starts the interactive Read-Eval-Print Loop.

### REPL Basics

```
uqal > mydb.orders.get_table(where active = true)
uqal > let x = 42
uqal > output x + 1
```

### Multi-Line Mode

Use `>>` to open a multi-line block. Close with `<<` or `>>-d`:

```
uqal > >>
... > let orders = mydb.orders.get_table()
... > for o in orders:
... >     output o.id
... > <<
```

Press **Ctrl+C** to cancel the current input without executing.

### Output Format per Result

Pipe any result to override the output format for that line:

```
uqal > mydb.orders.get_table() | json
uqal > mydb.orders.get_table() | csv
uqal > mydb.orders.get_table() | table
```

### Set Default Output Format

```
uqal > set output json
uqal > set output csv
uqal > set output table
```

### History & Completion

- Arrow keys cycle through command history
- Tab completion for connection names and common commands

---

## Connection Commands

### `uqal add-connection`

```bash
uqal add-connection <name> <module>
uqal add-connection mydb standard.postgresql --no-interactive
```

| Flag               | Description                                          |
|--------------------|------------------------------------------------------|
| `--host`           | Database host                                        |
| `--port`           | Database port                                        |
| `--database`       | Database / schema name                               |
| `--secret <k> <v>` | Secret key-value pair (stored in `.env`)            |
| `--no-interactive` | Skip all prompts, use only provided flags            |
| `--config-path`    | Use a specific `uqal_config.json` path               |

### `uqal update-connection`

```bash
uqal update-connection mydb --host newhost --port 5433
```

Updates one or more fields of an existing connection. Only the specified
flags are changed; the rest remain untouched.

### `uqal remove-connection`

```bash
uqal remove-connection mydb
```

Removes the connection from `uqal_config.json`. Secrets in `.env` must
be removed manually.

### `uqal list-connections`

```bash
uqal list-connections
```

Lists all configured connections with their module and host.

### `uqal test-connection`

```bash
uqal test-connection mydb
```

Attempts to open a connection and reports success or the error.

### `uqal set-config-path`

```bash
uqal set-config-path /path/to/uqal_config.json
```

Points UQAL to a non-default config file location. Saved globally.

---

## Module Commands

### `uqal list-modules`

```bash
uqal list-modules
```

Lists all installed UQAL modules (built-in and community).

### `uqal add-module`

```bash
uqal add-module /path/to/my_module
```

Registers a community or local module so it can be used in connection
declarations.

---

## Cache Commands

### `uqal cache status`

```bash
uqal cache status
```

Shows the cache state for each connection: last sync time, TTL remaining,
number of cached tables.

### `uqal cache clear`

```bash
uqal cache clear
```

Clears the full schema cache for all connections. The next query will
trigger a re-sync.

### `uqal cache drop-schema`

```bash
uqal cache drop-schema mydb
```

Clears the cached schema for a single connection only.

---

## Script Commands

Scripts are named UQAL files stored centrally, runnable by name.

### `uqal script list`

```bash
uqal script list
```

Lists all saved scripts with their names and descriptions.

### `uqal script show`

```bash
uqal script show my_report
```

Prints the content of a saved script.

### `uqal script run`

```bash
uqal script run my_report
uqal script run my_report --output csv
```

Executes a saved script, with optional output format override.

### `uqal script edit`

```bash
uqal script edit my_report
```

Opens the script in `$EDITOR` for editing.

### `uqal script rename`

```bash
uqal script rename old_name new_name
```

Renames a saved script.

### `uqal script delete`

```bash
uqal script delete my_report
```

Permanently removes a saved script.
