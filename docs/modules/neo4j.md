---
id: neo4j
title: Neo4j
unlisted: true
---

# Neo4j (`standard.neo4j`)

## Concept Mapping

| UQAL            | Neo4j                              |
|-----------------|------------------------------------|
| Table           | Node Label                         |
| Row             | Node                               |
| Field           | Node Property                      |
| Relationship    | No UQAL equivalent — use traversal syntax |
| `get_table`     | `MATCH (n:Label) RETURN n`         |
| `get_row`       | `MATCH (n:Label) RETURN n LIMIT 1` |
| `get_value`     | `MATCH (n:Label) RETURN n.prop LIMIT 1` |
| `insert_row`    | `CREATE (n:Label {…})`             |
| `update`        | `MATCH … SET`                      |
| `delete`        | `MATCH … DETACH DELETE`            |
| `create_view`   | **Not supported** (see below)      |
| Native escape   | `db.cypher("…")`                   |

## Connection Setup

```bash
# Local Neo4j
uqal add-connection graphdb standard.neo4j \
    --host localhost \
    --port 7687 \
    --database neo4j \
    --secret user neo4j \
    --secret password password \
    --no-interactive

# Neo4j AuraDB (cloud)
uqal add-connection auradb standard.neo4j \
    --option uri "neo4j+s://abc123.databases.neo4j.io" \
    --secret user neo4j \
    --secret password MyAuraPassword \
    --no-interactive
```

**Options available in `uqal_config.json`:**

| Key                   | Default       | Description                          |
|-----------------------|---------------|--------------------------------------|
| `host`                | `localhost`   | Neo4j server host                    |
| `port`                | `7687`        | Bolt protocol port                   |
| `database`            | `neo4j`       | Database name                        |
| `options.uri`         | —             | Full Bolt URI (overrides host/port)  |
| `options.connect_timeout` | `10`    | Connection timeout in seconds        |

## Node Queries

Standard UQAL syntax works directly against Neo4j node labels:

```
# Get all User nodes
graphdb.User.get_table()

# Filter by property
graphdb.Order.get_table(where status = "open", fields id, customer, total)

# Single node
graphdb.User.get_row(where id = 42)

# Single value
graphdb.Order.get_value(where id = 42, field total)
```

## Relationship Traversal

Graph relationships are the key feature that distinguishes Neo4j from
relational and document databases. UQAL extends the `query:` block syntax
with a relationship traversal expression.

### Simple Traversal

In the `where` clause of an alias inside a `query:` block, write:
`SOURCE RELATIONSHIP_TYPE TARGET`

```
let result = graphdb.query:
    let u = table User
    let o = table Order where u PLACED o
    return u.name, o.id, o.total
```

Generates:

```cypher
MATCH (u:`User`)-[:`PLACED`]->(o:`Order`)
RETURN u.name AS name, o.id AS id, o.total AS total
```

### Traversal with Relationship Properties

Use square brackets to access properties stored on the relationship itself:

```
let result = graphdb.query:
    let o = table Order
    let p = table Product where o CONTAINS[quantity, unit_price] p
    return o.id, p.name, quantity, unit_price
```

Generates:

```cypher
MATCH (o:`Order`)-[r_p:`CONTAINS`]->(p:`Product`)
RETURN o.id AS id, p.name AS name, r_p.quantity AS quantity, r_p.unit_price AS unit_price
```

The bracketed names `[quantity, unit_price]` are the relationship property
names. They appear as plain fields in the `return` clause and are resolved
to the relationship variable automatically.

### Multiple Hops

Chain multiple traversals to follow a path through the graph:

```
let result = graphdb.query:
    let u = table User
    let o = table Order where u PLACED o
    let p = table Product where o CONTAINS[quantity] p
    return u.name, p.name, quantity
```

## Type Mapping

| UQAL Core Type | Neo4j Type             |
|----------------|------------------------|
| `int`          | `Integer`              |
| `float`        | `Float`                |
| `varchar`      | `String`               |
| `bool`         | `Boolean`              |
| `date`         | `Date`                 |
| `datetime`     | `DateTime`             |
| `json`         | Stored as String       |
| `uuid`         | Stored as String       |

## Views: Not Supported

Neo4j does not have a native view concept. `create_view` raises a
`NotImplementedError` for this module.

**What to use instead:**

- Save complex traversal queries as **UQAL scripts** (`uqal script edit my_query`)
- Run them with `uqal script run my_query`
- Or use native Cypher for reusable query patterns

## Native Cypher

```
graphdb.cypher("MATCH (u:User)-[:PLACED]->(o:Order) RETURN u.name, count(o) AS order_count ORDER BY order_count DESC")
```

**Blocked patterns (security validator):**

| Pattern             | Reason                            |
|---------------------|-----------------------------------|
| `LOAD CSV`          | File system access                |
| `CALL { … }`        | Subquery (can bypass constraints) |
| `DROP`              | Destructive schema change         |
| `CREATE INDEX`      | Schema modification               |
| `CREATE CONSTRAINT` | Schema modification               |
| `APOC.`             | Requires explicit permission      |

## Example

```
# Connect
uqal add-connection graphdb standard.neo4j --host localhost --database neo4j

# Sync schema (reads node labels and property keys)
uqal run "graphdb.sync_schema"

# Query all orders placed by a specific user
uqal run "
let result = graphdb.query:
    let u = table User where u.name = 'Alice'
    let o = table Order where u PLACED o
    return u.name, o.id, o.total
"

# Traversal with relationship properties
uqal run "
let result = graphdb.query:
    let o = table Order
    let p = table Product where o CONTAINS[quantity, unit_price] p
    return o.id, p.name, quantity, unit_price
"
```
