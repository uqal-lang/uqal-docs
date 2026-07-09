---
id: syntax
title: MongoDB Syntax Reference
sidebar_label: Syntax Reference
sidebar_position: 2
---

# MongoDB Syntax Reference

All UQAL operations supported by `standard.mongodb`, with the generated MongoDB operation shown for each.

---

## get_table

```
db.collection.get_table()
db.collection.get_table(where <condition>)
db.collection.get_table(where <condition>, fields <field>, ...)
```

| UQAL | MongoDB |
|------|---------|
| `db.orders.get_table()` | `db.orders.find({})` |
| `db.orders.get_table(where active = true)` | `db.orders.find({ active: true })` |
| `db.orders.get_table(fields id, total)` | `db.orders.find({}, { id: 1, total: 1 })` |

---

## get_row

Returns the first matching document.

```
db.collection.get_row(where <condition>)
```

Generates `collection.findOne(filter)`.

---

## get_value

Returns a single field from the first matching document.

```
db.collection.get_value(where <condition>, field <field>)
```

Generates `findOne(filter, { field: 1 })`.

---

## insert_row

```
db.collection.insert_row(<field> = <value>, ...)
```

Generates `collection.insertOne({ field: value, … })`.

---

## update

```
db.collection.update(where <condition>, set <field> = <value>, ...)
```

Generates `collection.updateOne(filter, { $set: { field: value } })`.

---

## delete

```
db.collection.delete(where <condition>)
```

Generates `collection.deleteOne(filter)`.

---

## create_view

```
db.create_view <name>:
    let <a> = table <col_a>
    let <b> = table <col_b> where <a>.<id> = <b>.<ref>
    return <a>.<field>, <b>.<field>, ...
```

Generates a MongoDB aggregation pipeline with `$lookup` stored as a database view.

---

## Native MongoDB

```
db.mongo("<filter document>")
```

Passes a raw filter document to `find()`. Blocked patterns:

| Pattern | Reason |
|---------|--------|
| `$where` | JavaScript execution |
| `$function` | BSON function expressions |
| `mapReduce` | Arbitrary JavaScript |
| `eval` | Server-side JavaScript |

---

## Where Conditions

| UQAL operator | MongoDB |
|---------------|---------|
| `=` | `{ field: value }` |
| `!=` | `{ field: { $ne: value } }` |
| `>` | `{ field: { $gt: value } }` |
| `<` | `{ field: { $lt: value } }` |
| `>=` | `{ field: { $gte: value } }` |
| `<=` | `{ field: { $lte: value } }` |
| `and` | `{ $and: [ … ] }` |
| `or` | `{ $or: [ … ] }` |
| `is null` | `{ field: null }` |
| `is not null` | `{ field: { $ne: null } }` |
