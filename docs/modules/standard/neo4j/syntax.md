---
id: syntax
title: Neo4j Syntax Reference
sidebar_label: Syntax Reference
sidebar_position: 2
---

# Neo4j Syntax Reference

All UQAL operations supported by `standard.neo4j`, with the generated Cypher shown for each.

---

## get_table

```
db.Label.get_table()
db.Label.get_table(where <condition>)
db.Label.get_table(where <condition>, fields <prop>, ...)
```

| UQAL | Cypher |
|------|--------|
| `db.User.get_table()` | `MATCH (n:User) RETURN n` |
| `db.User.get_table(where active = true)` | `MATCH (n:User) WHERE n.active = $p0 RETURN n` |
| `db.User.get_table(fields id, name)` | `MATCH (n:User) RETURN n.id AS id, n.name AS name` |

---

## get_row

```
db.Label.get_row(where <condition>)
```

Generates `MATCH (n:Label) WHERE … RETURN n LIMIT 1`.

---

## get_value

```
db.Label.get_value(where <condition>, field <prop>)
```

Generates `MATCH (n:Label) WHERE … RETURN n.<prop> LIMIT 1`.

---

## insert_row

```
db.Label.insert_row(<prop> = <value>, ...)
```

Generates `CREATE (n:Label { prop: $p0, … })`.

---

## update

```
db.Label.update(where <condition>, set <prop> = <value>, ...)
```

Generates `MATCH (n:Label) WHERE … SET n.prop = $p0`.

---

## delete

```
db.Label.delete(where <condition>)
```

Generates `MATCH (n:Label) WHERE … DETACH DELETE n`.

`DETACH DELETE` removes the node and all its relationships.

---

## Relationship Traversal

Relationship traversal is only available inside a `query:` block.

### Simple Traversal

```
db.query:
    let <a> = table <LabelA>
    let <b> = table <LabelB> where <a> <RELATIONSHIP> <b>
    return <a>.<prop>, <b>.<prop>
```

Generates:

```cypher
MATCH (a:`LabelA`)-[:`RELATIONSHIP`]->(b:`LabelB`)
RETURN a.prop AS prop, b.prop AS prop
```

### Traversal with Relationship Properties

```
db.query:
    let <a> = table <LabelA>
    let <b> = table <LabelB> where <a> <REL>[<prop>, <prop>] <b>
    return <a>.<field>, <prop>, <prop>
```

The bracketed names are properties on the relationship itself. They become
plain identifiers in the `return` clause.

Generates:

```cypher
MATCH (a:`LabelA`)-[r_b:`REL`]->(b:`LabelB`)
RETURN a.field AS field, r_b.prop AS prop, r_b.prop AS prop
```

### Multi-Hop

Chain traversals to follow a path:

```
db.query:
    let u = table User
    let o = table Order where u PLACED o
    let p = table Product where o CONTAINS[quantity] p
    return u.name, p.name, quantity
```

---

## Native Cypher

```
db.cypher("<raw Cypher>")
```

Blocked patterns:

| Pattern | Reason |
|---------|--------|
| `LOAD CSV` | File system access |
| `CALL { … }` | Subquery bypass |
| `DROP` | Destructive schema change |
| `CREATE INDEX` | Schema modification |
| `CREATE CONSTRAINT` | Schema modification |
| `APOC.` | Requires explicit permission |

---

## Where Conditions

| UQAL operator | Cypher |
|---------------|--------|
| `=` | `n.prop = $p0` |
| `!=` | `n.prop <> $p0` |
| `>`, `<`, `>=`, `<=` | same |
| `and` | `… AND …` |
| `or` | `… OR …` |
| `is null` | `n.prop IS NULL` |
| `is not null` | `n.prop IS NOT NULL` |
