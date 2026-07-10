---
title: PostGIS
sidebar_position: 1
---

# PostGIS (`community.postgis`)

Adds PostGIS geospatial query syntax to PostgreSQL connections.

## Overview

PostGIS is a spatial database extension for PostgreSQL. This module extends
`standard.postgresql` with UQAL syntax for the most common PostGIS spatial
functions — letting you filter rows by geometry without writing raw SQL.

## Prerequisites

- PostgreSQL with PostGIS installed and enabled:
  ```sql
  CREATE EXTENSION postgis;
  ```
- `standard.postgresql` must be loaded (this module extends it)
- A geometry or geography column in your table

## Setup

```bash
uv add "git+https://github.com/uqal-lang/uqal-modules#subdirectory=modules/community.postgis"
```

Declare the module on your connection:

```json
{
  "connections": {
    "mydb": {
      "module": "standard.postgresql",
      "modules": ["standard.postgresql", "community.postgis"]
    }
  }
}
```

## Quick Example

```
let results = mydb.locations.get_table(
    where ST_Within(geom, "POLYGON((0 0,10 0,10 10,0 10,0 0))")
)
output results
```
