---
id: language-reference
title: Language Reference
sidebar_position: 3
---

# Language Reference

Complete UQAL syntax reference. All examples work against any connected database
unless noted otherwise.

---

## Variables

Assign any value to a named variable with `let`:

```
let x = 42
let name = "Alice"
let total = price * quantity
let result = mydb.orders.get_table(where active = true)
```

Variables are immutable once assigned. Use a new `let` to re-bind.

---

## Arithmetic & String Operations

```
let sum    = 10 + 5        # 15
let diff   = 10 - 5        # 5
let prod   = 10 * 5        # 50
let quot   = 10 / 5        # 2.0
let label  = "Order #" + id   # string concatenation
```

---

## Reading Data

### `get_table` — all matching rows

Returns every row that matches the condition as a result set.

```
mydb.orders.get_table()
mydb.orders.get_table(where active = true)
mydb.orders.get_table(where status = "open", fields id, name, total)
```

### `get_row` — first matching row

Returns exactly one row (the first match). Useful when you know the result
is unique.

```
let order = mydb.orders.get_row(where id = 42)
```

### `get_value` — single scalar

Returns a single value from a single field. The result is unwrapped from
the result set — you get the raw value directly.

```
let amount = mydb.orders.get_value(where id = 42, field total)
```

### `get` — shorthand for `get_table`

```
mydb.orders.get(where active = true)
```

### `where` — filter conditions

| Operator      | Example                          |
|---------------|----------------------------------|
| `=`           | `where status = "open"`          |
| `!=`          | `where status != "closed"`       |
| `>` `<` `>=` `<=` | `where age >= 18`           |
| `and`         | `where active = true and age > 18` |
| `or`          | `where role = "admin" or role = "owner"` |
| `not`         | `where not deleted`              |
| `is null`     | `where deleted_at is null`       |
| `is not null` | `where deleted_at is not null`   |

### `fields` / `field` — column selection

```
# multiple columns
mydb.orders.get_table(fields id, name, total)

# single column (used with get_value)
mydb.orders.get_value(where id = 1, field total)
```

---

## Writing Data

### `insert_row` — create a record

```
mydb.orders.insert_row(customer = "Alice", total = 99.90, active = true)
```

### `update` — modify existing records

A `where` clause is required to prevent accidental full-table updates.

```
mydb.orders.update(where id = 42, status = "shipped", shipped_at = "2024-01-15")
```

### `delete` — remove records

A `where` clause is required.

```
mydb.orders.delete(where id = 42)
```

---

## Table Management

### `insert_table` — create a table with schema

```
mydb.insert_table products(
    id int,
    name varchar,
    price float,
    active bool
)
```

### `create_view` — define a reusable named view

A view is a saved query. UQAL expands it at query time. The syntax mirrors
the `query:` block syntax.

```
mydb.create_view active_orders:
    let o = table orders where active = true
    return o.id, o.customer, o.total
```

After creation, query the view like a table:

```
mydb.active_orders.get_table()
```

**Auto-aliasing:** If two returned fields have the same name, UQAL appends
a numeric suffix automatically. Use `AS` for an explicit alias:

```
mydb.create_view order_summary:
    let o = table orders
    return o.id AS order_id, o.customer AS customer_name
```

---

## Cross-Table Queries

Use `db.query:` for queries that span multiple tables. The block defines
aliases and ends with a `return` statement.

```
let result = mydb.query:
    let o = table orders where status = "open"
    let c = table customers where c.id = o.customer_id
    return o.id, o.total, c.name
```

### Neo4j: Relationship Traversal

For graph databases, the `where` clause in a `query:` block can express
graph relationships directly:

```
let result = graphdb.query:
    let u = table User
    let o = table Order where u PLACED o
    return u.name, o.id, o.total
```

With relationship properties:

```
let result = graphdb.query:
    let o = table Order
    let p = table Product where o CONTAINS[quantity, price] p
    return o.id, p.name, quantity, price
```

See [Neo4j module](./modules/neo4j.md) for details.

---

## Control Flow

### `if / elif / else`

```
let status = mydb.orders.get_value(where id = 42, field status)

if status = "open":
    output "Order is open"
elif status = "shipped":
    output "Order is on its way"
else:
    output "Unknown status"
```

### `for`

```
let orders = mydb.orders.get_table(where active = true)

for order in orders:
    output order.id + ": " + order.customer
```

### `while`

```
let count = 0
while count < 5:
    output count
    let count = count + 1
```

---

## Output

`output` sends a value to the current output target (terminal, file, or REPL).

```
output "Hello, World!"
output result
output order.total * 1.19
```

In the REPL, any expression at the top level is automatically output.
In scripts and `uqal run`, you need an explicit `output` statement.

---

## Native Queries (Escape Hatch)

When UQAL's abstraction is not enough, write in the database's native
language directly. The native query runs through the module's security
validator before execution.

```
# PostgreSQL
mydb.sql("SELECT id, name FROM orders WHERE active = true ORDER BY id DESC LIMIT 10")

# MongoDB
mydb.mongo("{ active: true }")

# Neo4j
graphdb.cypher("MATCH (u:User)-[:PLACED]->(o:Order) RETURN u.name, count(o) AS order_count")
```

The exact native command name is defined by the module. See the module guides
for what is blocked by the security validator.

---

## Schema Commands

```
# Load or refresh schema from the database
mydb.sync_schema

# List all tables / collections / node labels in the connected database
mydb.list_tables
```

---

## System Commands

```
# List all configured database connections
list dbs

# List all installed UQAL modules
list modules
```

---

## Output Formats

Results can be rendered as a table (default), JSON, or CSV.

In the CLI:

```bash
uqal run "mydb.orders.get_table()" --output json
uqal run "mydb.orders.get_table()" --output csv
```

In the REPL, pipe the result:

```
uqal > mydb.orders.get_table() | json
uqal > mydb.orders.get_table() | csv
uqal > mydb.orders.get_table() | table
```

Or change the default for the session:

```
uqal > set output json
```
