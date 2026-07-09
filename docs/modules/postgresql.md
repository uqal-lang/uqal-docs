---
id: postgresql
title: PostgreSQL
unlisted: true
---

# PostgreSQL (`standard.postgresql`)

## Concept Mapping

| UQAL            | PostgreSQL             |
|-----------------|------------------------|
| Table           | Table or View          |
| Row             | Row                    |
| Field           | Column                 |
| `get_table`     | `SELECT … FROM`        |
| `get_row`       | `SELECT … LIMIT 1`     |
| `get_value`     | `SELECT field … LIMIT 1` |
| `insert_row`    | `INSERT INTO … VALUES` |
| `update`        | `UPDATE … SET`         |
| `delete`        | `DELETE FROM`          |
| `create_view`   | `CREATE OR REPLACE VIEW` |
| Native escape   | `db.sql("…")`          |

## Connection Setup

```bash
uqal add-connection mydb standard.postgresql \
    --host localhost \
    --port 5432 \
    --database mydb \
    --secret user myuser \
    --secret password mypassword \
    --no-interactive
```

**Options available in `uqal_config.json`:**

| Key              | Default     | Description                          |
|------------------|-------------|--------------------------------------|
| `host`           | `localhost` | PostgreSQL server host               |
| `port`           | `5432`      | PostgreSQL server port               |
| `database`       | —           | Database name                        |
| `options.sslmode`| `prefer`    | SSL mode (`disable`, `require`, …)   |
| `options.connect_timeout` | `10` | Connection timeout in seconds    |

## Type Mapping

| UQAL Core Type | PostgreSQL Type           |
|----------------|---------------------------|
| `int`          | `INTEGER`                 |
| `float`        | `DOUBLE PRECISION`        |
| `varchar`      | `VARCHAR`                 |
| `bool`         | `BOOLEAN`                 |
| `date`         | `DATE`                    |
| `datetime`     | `TIMESTAMP WITH TIME ZONE`|
| `json`         | `JSONB`                   |
| `uuid`         | `UUID`                    |

## Schema Discovery

UQAL discovers your schema by reading PostgreSQL's `information_schema`:

- Tables from `information_schema.tables`
- Columns and types from `information_schema.columns`
- Views are included automatically — they appear as regular tables in UQAL

After a `sync_schema`, any view in your database is queryable like a table:

```
mydb.active_orders.get_table()
```

## Views

`create_view` translates to a `CREATE OR REPLACE VIEW` in PostgreSQL:

```
mydb.create_view active_orders:
    let o = table orders where active = true
    return o.id, o.customer, o.total
```

Generates:

```sql
CREATE OR REPLACE VIEW active_orders AS
SELECT o.id, o.customer, o.total
FROM orders o
WHERE o.active = true
```

After the next `sync_schema`, the view is available for querying.

## Native SQL

```
mydb.sql("SELECT id, name, SUM(total) AS revenue FROM orders GROUP BY id, name ORDER BY revenue DESC")
```

**Blocked patterns (security validator):**

- `DROP TABLE` / `DROP DATABASE`
- `TRUNCATE`
- `CREATE USER` / `ALTER USER`
- `GRANT` / `REVOKE`

Safe DDL like `CREATE TABLE` and `CREATE INDEX` passes through unless
explicitly blocked in your configuration.

## Example

```
# Connect
uqal add-connection hrdb standard.postgresql --host db.example.com --database hr

# Sync schema
uqal run "hrdb.sync_schema"

# Query employees
uqal run "hrdb.employees.get_table(where department = 'Engineering', fields id, name, salary)"

# Create a view
uqal run "hrdb.create_view senior_engineers:
    let e = table employees where department = 'Engineering' and years_experience >= 5
    return e.id AS employee_id, e.name, e.salary"

# Query the view
uqal run "hrdb.senior_engineers.get_table()"
```
