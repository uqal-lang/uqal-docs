---
id: extension-modules
title: Extension Modules
sidebar_position: 4
---

# Extension Modules

Extension modules add capabilities to an existing primary module — rather
than providing a full database implementation.

## Primary Module vs. Extension Module

A **primary module** is a complete database implementation. It handles
connection, translation, execution, and schema discovery.

An **extension module** extends the grammar or capabilities of a primary
module — for example, adding geospatial query syntax to PostgreSQL via
PostGIS, or adding vector search syntax to MongoDB.

In practice, the distinction is in how the module is declared in the
connection config:

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

The first entry in `modules` is the primary module. Subsequent entries
are extension modules. The grammar from all declared modules is merged
at startup.

## What Works Today

- **Multiple modules loaded simultaneously** — `GrammarBuilder` merges
  grammar extensions from all modules without conflicts
- **Grammar merge** — two modules can both contribute to the same extension
  point (e.g. `condition`); their alternatives are joined with `|`
- **No naming collisions** — the compliance test suite verifies that no
  two loaded modules declare the same grammar rule name or native command
- **Capability declaration** — each module declares which extension points
  it contributes to via `get_capabilities()`

## What Is Not Yet Implemented

**TranslatorDispatcher for grammar-level extensions:** When two modules
contribute to the same extension point (e.g., both Neo4j and PostGIS
contribute to `condition`), there is no automatic routing of the resulting
AST node to the correct module's translator. The primary module's
`translate()` method handles all AST nodes and must manually dispatch
any extension-module-specific nodes.

This means extension modules that add new grammar require the primary
module to explicitly handle the new node types. For now, this is a
deliberate design constraint — it keeps the execution path simple and
auditable.

## Building an Extension Module

An extension module implements `UQALModule` but can leave non-applicable
methods as stubs:

```python
class PostGISExtension(UQALModule):
    def get_manifest(self):
        return ModuleManifest(name="community.postgis", version="0.1.0")

    def get_grammar_extension(self) -> str:
        ext = Path(__file__).parent / "grammar_extension.lark"
        return ext.read_text()

    def get_capabilities(self):
        return CapabilityManifest(
            grammar_extensions={"condition": ["postgis_within"]}
        )

    # These are only used by primary modules:
    def build_connection(self, config): raise NotImplementedError
    def translate(self, node): raise NotImplementedError
    def execute(self, query, connection): raise NotImplementedError
    def sync_schema_from_source(self, connection): raise NotImplementedError
    def create_view(self, *args): raise NotImplementedError
```

The primary module (`standard.postgresql`) then handles the `postgis_within`
node type in its `translate()` method.

## Naming Conventions

| Scope         | Prefix       | Example                          |
|---------------|--------------|----------------------------------|
| Built-in      | `standard.*` | `standard.postgresql`            |
| Community     | `community.*`| `community.postgis`              |
| Private/Local | `local.*`    | `local.mycompany_extension`      |

The prefix is just a convention — it is not enforced by the loader.
Using it consistently makes it easy to distinguish origin at a glance.

## Registering an Extension Module

```bash
uqal add-module /path/to/my_extension
```

Then declare it in the connection configuration:

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
