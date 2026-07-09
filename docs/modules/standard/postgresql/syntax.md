---
id: syntax
title: PostgreSQL Syntax Reference
sidebar_label: Syntax Reference
sidebar_position: 2
---

# PostgreSQL Syntax Reference

All UQAL operations supported by `standard.postgresql`, with the generated SQL shown for each.

---

## get_table

```
db.table.get_table()
db.table.get_table(where <condition>)
db.table.get_table(where <condition>, fields <col>, <col>, ...)
```

| UQAL | PostgreSQL |
|------|-----------|
| `db.orders.get_table()` | `SELECT * FROM orders` |
| `db.orders.get_table(where active = true)` | `SELECT * FROM orders WHERE active = $1` |
| `db.orders.get_table(fields id, total)` | `SELECT id, total FROM orders` |

---

## get_row

Returns the first matching row.

```
db.table.get_row(where <condition>)
db.table.get_row(where <condition>, fields <col>, ...)
```

Generates `SELECT … LIMIT 1`.

---

## get_value

Returns a single field value from the first matching row.

```
db.table.get_value(where <condition>, field <col>)
```

Generates `SELECT <col> FROM … LIMIT 1`.

---

## insert_row

```
db.table.insert_row(<col> = <value>, <col> = <value>, ...)
```

Generates `INSERT INTO table (col, col) VALUES ($1, $2)`.

---

## update

```
db.table.update(where <condition>, set <col> = <value>, ...)
```

Generates `UPDATE table SET col = $1 WHERE …`.

---

## delete

```
db.table.delete(where <condition>)
```

Generates `DELETE FROM table WHERE …`.

---

## create_view

```
db.create_view <name>:
    let <alias> = table <table> where <condition>
    return <alias>.<col> AS <name>, ...
```

Generates `CREATE OR REPLACE VIEW <name> AS SELECT …`.

Views are persisted in the database and available after the next `sync_schema`.

---

## Native SQL

```
db.sql("<raw SQL>")
```

Executes a raw SQL statement directly. Blocked patterns:

| Pattern | Reason |
|---------|--------|
| `DROP TABLE` / `DROP DATABASE` | Destructive |
| `TRUNCATE` | Destructive |
| `CREATE USER` / `ALTER USER` | Privilege escalation |
| `GRANT` / `REVOKE` | Privilege escalation |

---

## Where Conditions

| UQAL operator | SQL |
|---------------|-----|
| `=` | `=` |
| `!=` | `<>` |
| `>`, `<`, `>=`, `<=` | same |
| `and` | `AND` |
| `or` | `OR` |
| `not` | `NOT` |
| `is null` | `IS NULL` |
| `is not null` | `IS NOT NULL` |

All values are passed as parameterised placeholders (`$1`, `$2`, …) — no string interpolation.
