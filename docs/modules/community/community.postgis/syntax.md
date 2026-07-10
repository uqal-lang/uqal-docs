---
title: PostGIS Syntax Reference
sidebar_label: Syntax Reference
sidebar_position: 2
---

# PostGIS Syntax Reference

## ST_Within

**Description**: Returns rows where the geometry column falls entirely within the given polygon.

**Syntax**:
```
db.table.get_table(where ST_Within(geom_column, polygon_wkt))
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `geom_column` | column name | The geometry column to test |
| `polygon_wkt` | string | WKT polygon string |

**Example**:
```
let results = mydb.locations.get_table(
    where ST_Within(geom, "POLYGON((0 0,10 0,10 10,0 10,0 0))")
)
```

**Generated SQL**:
```sql
SELECT * FROM locations WHERE ST_Within(geom, $1)
-- $1 = 'POLYGON((0 0,10 0,10 10,0 10,0 0))'
```

---

## ST_Intersects

**Description**: Returns rows where the geometry column intersects the given polygon.

**Syntax**:
```
db.table.get_table(where ST_Intersects(geom_column, polygon_wkt))
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `geom_column` | column name | The geometry column to test |
| `polygon_wkt` | string | WKT polygon string |

**Example**:
```
let results = mydb.regions.get_table(
    where ST_Intersects(boundary, "POLYGON((5 5,15 5,15 15,5 15,5 5))")
)
```

---

## ST_DWithin

**Description**: Returns rows where the geometry column is within a given distance of a point.

**Syntax**:
```
db.table.get_table(where ST_DWithin(geom_column, point_wkt, distance))
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `geom_column` | column name | The geometry column to test |
| `point_wkt` | string | WKT point string |
| `distance` | number | Distance in the unit of the column's CRS |

**Example**:
```
let nearby = mydb.shops.get_table(
    where ST_DWithin(location, "POINT(13.4050 52.5200)", 1000)
)
```

**Generated SQL**:
```sql
SELECT * FROM shops WHERE ST_DWithin(location, $1, $2)
-- $1 = 'POINT(13.4050 52.5200)', $2 = 1000
```
