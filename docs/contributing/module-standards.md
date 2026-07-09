---
id: module-standards
title: Module Standards
sidebar_position: 6
---

# Module Standards

This page defines the mandatory structure every community module must follow —
the `module.json` schema, module types, and the required documentation format.

---

## Module Types

Every module must declare its type in `module.json`. The type determines
which interface methods must be implemented and how the module is loaded.

### `standalone`

A complete database implementation. Handles its own connection, translation,
execution, and schema discovery. Users can point a connection directly at
this module.

```json
{ "type": "standalone" }
```

Required interface methods: all of `UQALModule`.

Examples: `standard.postgresql`, `standard.mongodb`, `standard.neo4j`

### `extension`

Adds grammar or capabilities to an existing primary module. Does not provide
its own connection — it must be loaded alongside the module it extends.

```json
{ "type": "extension", "extends": "standard.postgresql" }
```

Required interface methods: `get_manifest`, `get_grammar_extension`,
`get_capabilities`. All other methods may raise `NotImplementedError`.

Examples: `community.postgis` (extends PostgreSQL), `community.pgvector`

The `extends` field is used by:
- The loader to verify the primary module is present before loading the extension
- The documentation site to group the extension under its primary module
- CI to validate that the primary module's interface version is compatible

---

## `module.json` Schema

Every module directory must contain a `module.json` at its root.

```json
{
  "name": "community.postgis",
  "version": "0.2.0",
  "compatible_with": 1,
  "type": "extension",
  "extends": "standard.postgresql",
  "description": "PostGIS geospatial syntax for PostgreSQL connections.",
  "author": "Your Name",
  "repository": "https://github.com/uqal/uqal-modules"
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✓ | Module identifier. Must use a valid prefix (`community.*`, `local.*`). |
| `version` | ✓ | Semantic version string: `MAJOR.MINOR.PATCH`. |
| `compatible_with` | ✓ | Integer. Must match the current `UQALModule.INTERFACE_VERSION`. |
| `type` | ✓ | `"standalone"` or `"extension"`. |
| `extends` | if extension | The `name` of the primary module this extension depends on. |
| `description` | ✓ | One-sentence summary. Shown in `uqal list-modules` and the docs index. |
| `author` | ✓ | Name or GitHub handle of the module author. |
| `repository` | ✓ | URL of the source repository. |

### Version Bumping

**Do not set `version` manually.** CI writes the version automatically on
every merge to `main`, based on the PR title type:

| PR type | Bump | Example |
|---------|------|---------|
| `breaking` | Major | `1.0.0 → 2.0.0` |
| `feat` | Minor | `0.1.0 → 0.2.0` |
| `fix`, `refactor` | Patch | `0.1.1 → 0.1.2` |
| `docs`, `test` | None | No publish triggered |

The version in `module.json` is updated by CI before the package is built.
You only need to ensure the field exists in the file — its value will be
overwritten. See [Community Workflow](./community-workflow.md) for the full
automatic versioning flow.

### `compatible_with`

The `compatible_with` value must equal `UQALModule.INTERFACE_VERSION`.
This integer is bumped only when the `UQALModule` interface itself changes
in a breaking way (e.g. a required method is renamed or its signature changes).

CI blocks the PR if `compatible_with` does not match the current interface version.

---

## Naming Conventions

| Scope | Prefix | Example |
|-------|--------|---------|
| Built-in (maintained by core team) | `standard.*` | `standard.postgresql` |
| Community (third-party, in uqal-modules) | `community.*` | `community.postgis` |
| Private / company-internal | `local.*` | `local.mycompany_db` |

Prefixes are a convention, not enforced by the loader. Using them consistently
makes it immediately clear where a module comes from.

---

## Required Test Structure

Every module must include a `tests/` folder. CI checks for the required files
and runs coverage before a PR can be merged.

```
modules/community.postgis/
├── module.json
├── __init__.py
├── translator.py
├── native_validator.py
├── grammar_extension.lark        (if grammar extension)
├── docker-compose.test.yml       (mandatory for standalone, recommended for extension)
├── tests/
│   ├── unit/
│   │   ├── test_translator.py    ← mandatory
│   │   └── test_validator.py     ← mandatory if native_validator.py exists
│   ├── grammar/
│   │   └── test_grammar.py       ← mandatory if grammar_extension.lark exists
│   └── integration/
│       └── test_integration.py   ← mandatory for standalone, recommended for extension
└── docs/
    ├── index.md
    └── syntax.md
```

### Coverage Requirements

| File | Minimum coverage | Reason |
|------|-----------------|--------|
| `translator.py` | 80% | Core translation logic |
| `native_validator.py` | 90% | Security-critical |
| `grammar_extension.lark` | 100% of rules | Every rule needs at least one grammar test |
| `connection_schema.py` | no threshold | Trivial field declarations |
| `__init__.py` | no threshold | Trivial |

### How to Write Tests: Output-Based Testing

The core idea: **assert what comes out, not what happens inside the database.**

Every test verifies the output of the translator — the query string and
parameters it generates — without a real database connection. This makes
tests fast, deterministic, and runnable in any CI environment.

---

#### Unit Tests — Translator Output (`tests/unit/test_translator.py`)

```python
import pytest
from unittest.mock import MagicMock
from uqal_core.ast.nodes import DbTableCall, Compare, VariableRef, StringLiteral
from community_postgis.translator import PostGISTranslator

@pytest.fixture
def translator():
    return PostGISTranslator()

# ── Translation output ────────────────────────────────────────────────────────

def test_st_within_generates_correct_sql(translator):
    node = STWithinNode(column="geom", polygon="POLYGON((0 0,1 0,1 1,0 0))")
    query, params = translator.translate(node)
    assert "ST_Within(geom, $1)" in query
    assert list(params.values())[0] == "POLYGON((0 0,1 0,1 1,0 0))"

def test_st_distance_returns_parameterised_value(translator):
    node = STDistanceNode(col_a="point_a", col_b="point_b")
    query, params = translator.translate(node)
    assert "ST_Distance(point_a, point_b)" in query
    assert params == {}   # no user-supplied value → no params

def test_get_table_with_spatial_filter(translator):
    # Full UQAL node tree: get_table(where ST_Within(geom, '...'))
    condition = STWithinNode(column="geom", polygon="POLYGON((...))")
    node = DbTableCall(table="locations", command="get_table", where=condition)
    query, params = translator.translate(node)
    assert query.startswith("SELECT")
    assert "ST_Within" in query
    assert len(params) == 1

# ── Edge cases ────────────────────────────────────────────────────────────────

def test_null_polygon_raises(translator):
    with pytest.raises(ValueError, match="polygon"):
        translator.translate(STWithinNode(column="geom", polygon=None))

def test_empty_column_raises(translator):
    with pytest.raises(ValueError):
        translator.translate(STWithinNode(column="", polygon="POLYGON((...))"))
```

---

#### Unit Tests — Native Validator (`tests/unit/test_validator.py`)

```python
from community_postgis.native_validator import security_check

# ── Blocked patterns ──────────────────────────────────────────────────────────

def test_drop_table_is_blocked():
    errors = security_check("DROP TABLE locations")
    assert len(errors) > 0
    assert any("DROP" in e for e in errors)

def test_truncate_is_blocked():
    errors = security_check("TRUNCATE locations")
    assert len(errors) > 0

# ── Allowed patterns ──────────────────────────────────────────────────────────

def test_select_with_st_within_is_allowed():
    errors = security_check("SELECT * FROM locations WHERE ST_Within(geom, $1)")
    assert errors == []

def test_select_with_st_distance_is_allowed():
    errors = security_check("SELECT ST_Distance(a, b) FROM points")
    assert errors == []

# ── Case insensitive ──────────────────────────────────────────────────────────

def test_drop_lowercase_is_blocked():
    errors = security_check("drop table locations")
    assert len(errors) > 0
```

---

#### Unit Tests — Connection / Auth Extensions (`tests/unit/test_translator.py`)

For auth extensions (Kerberos, mTLS, etc.) there is no query to assert.
Instead, mock the driver and assert it is called with the correct parameters.

```python
from unittest.mock import MagicMock, patch
from community_mongo_kerberos import KerberosExtension

def test_kerberos_passes_gssapi_mechanism():
    module = KerberosExtension()
    mock_driver = MagicMock()

    with patch("community_mongo_kerberos.pymongo.MongoClient", mock_driver):
        module.build_connection({"host": "db.example.com", "service": "mongodb"})

    mock_driver.assert_called_once_with(
        "db.example.com",
        authMechanism="GSSAPI",
        authSource="$external",
    )

def test_kerberos_service_name_is_configurable():
    module = KerberosExtension()
    mock_driver = MagicMock()

    with patch("community_mongo_kerberos.pymongo.MongoClient", mock_driver):
        module.build_connection({"host": "db.example.com", "service": "myservice"})

    call_kwargs = mock_driver.call_args.kwargs
    assert call_kwargs["authMechanismProperties"] == "SERVICE_NAME:myservice"
```

---

#### Grammar Tests (`tests/grammar/test_grammar.py`)

Grammar tests verify that your new syntax parses to the right AST node type.
No database, no translation — only parsing.

```python
import pytest
from lark import Token
from uqal_core.grammar.builder import GrammarBuilder
from uqal_core.transformer import UQALTransformer
from standard_postgresql import PostgreSQLModule
from community_postgis import PostGISExtension
from community_postgis.nodes import STWithinNode, STDistanceNode

@pytest.fixture(scope="module")
def parse():
    grammar = GrammarBuilder().build([PostgreSQLModule(), PostGISExtension()])
    transformer = UQALTransformer()
    def _parse(query):
        tree = grammar.parse(query)
        return transformer.transform(tree)
    return _parse

# ── Parses to correct node type ───────────────────────────────────────────────

def test_st_within_produces_node(parse):
    result = parse("mydb.locations.get_table(where ST_Within(geom, 'POLYGON(...)'))")
    # Walk the result to find the condition node
    condition = result.steps[0].where
    assert isinstance(condition, STWithinNode)

def test_st_within_column_captured(parse):
    result = parse("mydb.locations.get_table(where ST_Within(point_col, 'POLYGON(...)'))")
    condition = result.steps[0].where
    assert condition.column == "point_col"

def test_st_distance_produces_node(parse):
    result = parse("mydb.points.get_table(where ST_Distance(a, b) < 100)")
    condition = result.steps[0].where
    assert isinstance(condition.left, STDistanceNode)

# ── Invalid syntax raises parse error ────────────────────────────────────────

def test_st_within_missing_polygon_raises(parse):
    with pytest.raises(Exception):
        parse("mydb.locations.get_table(where ST_Within(geom))")

def test_unknown_spatial_function_raises(parse):
    with pytest.raises(Exception):
        parse("mydb.locations.get_table(where ST_NotReal(geom, 'x'))")
```

---

#### Integration Tests (`tests/integration/test_integration.py`)

Only runs in CI when `docker-compose.test.yml` is present. Skipped otherwise.

```python
import pytest
import os

# Skip entire file if no DB configured
pytestmark = pytest.mark.skipif(
    os.getenv("TEST_DB_HOST") is None,
    reason="Integration tests require TEST_DB_HOST environment variable"
)

def test_st_within_returns_results(pg_connection):
    # pg_connection is a pytest fixture that connects to the test DB
    result = uqal.run(
        "testdb.locations.get_table(where ST_Within(geom, 'POLYGON((0 0,10 0,10 10,0 0))'))",
        connection=pg_connection
    )
    assert len(result.rows) > 0

def test_st_within_excludes_out_of_bounds(pg_connection):
    result = uqal.run(
        "testdb.locations.get_table(where ST_Within(geom, 'POLYGON((90 90,91 90,91 91,90 90))'))",
        connection=pg_connection
    )
    assert len(result.rows) == 0
```

### Test Mandatory by Module Type

| Test | `standalone` | `extension` |
|------|-------------|-------------|
| Unit tests (mock-based) | Mandatory | Mandatory |
| Grammar tests | Mandatory if grammar present | Mandatory (grammar is the main purpose) |
| Compliance suite | Mandatory | Mandatory |
| Integration tests | Optional — run if `docker-compose.test.yml` present | Optional |
| `docker-compose.test.yml` | Recommended | Optional |

---

## Required Documentation Structure

Every module must include exactly two documentation files. Additional pages
are allowed but optional.

```
modules/community.postgis/
└── docs/
    ├── index.md       ← mandatory
    ├── syntax.md      ← mandatory
    └── advanced.md    ← optional, any name
```

CI blocks the PR if `docs/index.md` or `docs/syntax.md` is missing, or if
the mandatory sections (see below) are absent.

---

## `index.md` — Required Sections

`index.md` is the main page a user lands on when they find your module.

```markdown
---
title: PostGIS
---

# PostGIS (`community.postgis`)

One sentence: what this module is and what it extends.

## Overview

What problem does this module solve? What does it add to the primary module?
Two to four sentences.

## Prerequisites

What must be set up before this module works.
This section is mandatory — missing prerequisites are the most common
support issue for extension modules.

Example:
- PostGIS extension must be enabled: `CREATE EXTENSION postgis;`
- PostgreSQL >= 12

## Setup

How to install and register the module:

    uv add uqal-postgis
    uqal add-module community.postgis

Connection config example (module.json / uqal_config.json).

## Quick Example

One complete, copy-paste-ready example that shows the most common use case.
```

### Mandatory section checklist

| Section | Required |
|---------|----------|
| `## Overview` | ✓ |
| `## Prerequisites` | ✓ |
| `## Setup` | ✓ |
| `## Quick Example` | ✓ |

---

## `syntax.md` — Required Sections

`syntax.md` is the syntax reference. One entry per new feature the module adds.

```markdown
---
title: PostGIS Syntax Reference
---

# PostGIS Syntax Reference

## ST_Within

**Description**: Returns rows where the geometry column falls within
a given polygon.

**Syntax**:

    db.table.get_table(where ST_Within(geom_column, polygon_wkt))

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `geom_column` | column reference | The geometry column to test |
| `polygon_wkt` | string literal | WKT polygon string |

**Example**:

    let results = mydb.locations.get_table(
        where ST_Within(geom, "POLYGON((...))")
    )

---

## ST_Distance

...
```

### Mandatory section checklist per feature

| Element | Required |
|---------|----------|
| Feature heading | ✓ |
| Description (one line) | ✓ |
| Syntax block | ✓ |
| Example | ✓ |
| Parameters table | if the feature takes parameters |

---

## Optional Pages

Contributors may add as many additional pages as they want under `docs/`.
Common additions:

| Page | When useful |
|------|-------------|
| `advanced.md` | Advanced configuration, performance tuning |
| `migration.md` | How to migrate from an older version of the module |
| `type-mapping.md` | Full mapping of database-native types to UQAL types |
| `changelog.md` | Module-specific changelog (auto-generated from git-cliff) |

All pages in `docs/` are automatically included in the documentation site
under the module's section when the PR is merged to main.

---

## Docusaurus Frontmatter

Every documentation page must start with a valid Docusaurus frontmatter block:

```markdown
---
title: Page Title
---
```

Optional fields:

```markdown
---
title: PostGIS Syntax Reference
sidebar_label: Syntax Reference
sidebar_position: 2
---
```

`sidebar_position` controls the order within the module's section.
`index.md` should be position 1, `syntax.md` position 2.
