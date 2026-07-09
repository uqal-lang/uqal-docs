---
id: mongodb
title: MongoDB
unlisted: true
---

# MongoDB (`standard.mongodb`)

## Concept Mapping

| UQAL            | MongoDB                        |
|-----------------|--------------------------------|
| Table           | Collection                     |
| Row             | Document                       |
| Field           | Field                          |
| `get_table`     | `find()`                       |
| `get_row`       | `findOne()`                    |
| `get_value`     | `findOne()` with projection    |
| `insert_row`    | `insertOne()`                  |
| `update`        | `updateOne()` with `$set`      |
| `delete`        | `deleteOne()`                  |
| `create_view`   | Aggregation pipeline           |
| Native escape   | `db.mongo("…")`                |

## Connection Setup

```bash
# Local or self-hosted
uqal add-connection mydb standard.mongodb \
    --host localhost \
    --port 27017 \
    --database mydb \
    --secret user myuser \
    --secret password mypassword \
    --no-interactive

# MongoDB Atlas (connection string)
uqal add-connection atlasdb standard.mongodb \
    --option connection_string "mongodb+srv://user:password@cluster.mongodb.net/mydb" \
    --no-interactive
```

**Options available in `uqal_config.json`:**

| Key                       | Default     | Description                           |
|---------------------------|-------------|---------------------------------------|
| `host`                    | `localhost` | MongoDB host                          |
| `port`                    | `27017`     | MongoDB port                          |
| `database`                | —           | Database name                         |
| `options.connection_string` | —         | Full connection string (overrides host/port) |
| `options.connect_timeout` | `10`        | Connection timeout in seconds         |

## Type Mapping

| UQAL Core Type | MongoDB BSON Type |
|----------------|-------------------|
| `int`          | `Int32` / `Int64` |
| `float`        | `Double`          |
| `varchar`      | `String`          |
| `bool`         | `Boolean`         |
| `date`         | `Date`            |
| `datetime`     | `Date`            |
| `json`         | `Object`          |
| `uuid`         | `String` (UUID format) |

## Schema Discovery: Strict vs. Flexible Collections

MongoDB collections are schema-less by default. UQAL handles this in two ways:

**Strict collections** — the collection has a `$jsonSchema` validator defined
in MongoDB. UQAL reads the validator and uses it as the schema. These collections
behave like typed tables.

**Flexible collections** — no validator defined. UQAL samples a configurable
number of documents and aggregates all field names found. The result is a
best-effort schema for REPL completion and type checking.

The `flexible` flag in the schema store marks a collection as flexible. You can
force a collection to be treated as flexible even if it has a validator:

```json
{
  "options": {
    "flexible_collections": ["logs", "events"]
  }
}
```

## Views

`create_view` translates to a MongoDB aggregation pipeline with `$lookup` and
`$unwind` for cross-collection queries:

```
mydb.create_view order_with_customer:
    let o = table orders
    let c = table customers where c.id = o.customer_id
    return o.id, o.total, c.name
```

Generates an aggregation pipeline stored as a MongoDB view.

## Native MongoDB Queries

Pass a raw MongoDB filter document:

```
mydb.mongo("{ active: true, total: { $gt: 100 } }")
```

**Blocked patterns (security validator):**

- `$where` (JavaScript execution)
- `$function` (BSON function expressions)
- `mapReduce` (arbitrary JS)
- `eval` command

## Example

```
# Connect
uqal add-connection shopdb standard.mongodb --host localhost --database shop

# Sync schema
uqal run "shopdb.sync_schema"

# Query with filter and field selection
uqal run "shopdb.orders.get_table(where status = 'open', fields id, customer, total)"

# Insert a document
uqal run "shopdb.orders.insert_row(customer = 'Alice', total = 149.90, status = 'open')"

# Native query — orders over 500 with specific fields
uqal run "shopdb.mongo('{ total: { \$gt: 500 } }')"
```
