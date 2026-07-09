---
id: module-development
title: Building a Module
sidebar_position: 3
---

# Building a Database Module

A UQAL module is a Python package that implements the `UQALModule` interface.
Once registered, the module handles translation, execution, and schema
discovery for a specific database.

## File Structure

```
my_module/
├── __init__.py
├── capabilities.py          # grammar extension points and capabilities
├── connection_schema.py     # Pydantic model for connection config
├── grammar_extension.lark   # grammar extension rules (optional)
├── module.py                # main UQALModule implementation
├── native_validator.py      # security check for native queries
├── schema_sync.py           # schema discovery logic
├── translator.py            # AST → native query translation
└── type_mapping.py          # UQAL core types → database types
```

## The `UQALModule` Interface

All methods grouped by responsibility:

### Identity

```python
def get_manifest(self) -> ModuleManifest:
    return ModuleManifest(name="community.mydb", version="0.1.0")

def get_grammar_extension(self) -> str:
    # Return content of grammar_extension.lark, or "" if none
    ext_file = Path(__file__).parent / "grammar_extension.lark"
    return ext_file.read_text() if ext_file.exists() else ""

def get_capabilities(self) -> CapabilityManifest:
    return MY_CAPABILITIES  # defined in capabilities.py

def get_type_mapping(self) -> dict[str, Any]:
    return dict(CORE_TO_MYDB)  # defined in type_mapping.py

def get_native_command_name(self) -> str:
    return "mydb"  # enables db.mydb("…") syntax
```

### Connection

```python
def get_connection_schema(self) -> type[ConnectionSchema]:
    return MyDbConnectionSchema  # Pydantic model in connection_schema.py

def build_connection(self, config: Any) -> Any:
    # Return the native driver/client object
    return mydb_driver.connect(host=config.host, port=config.port, ...)
```

### Translation & Execution

```python
def translate(self, ast_subtree: Any) -> Any:
    # Convert AST node to something execute() understands
    # Typically returns (native_query_string, params_dict)
    return self._translator.translate(ast_subtree)

def execute(self, native_query: Any, connection: Any) -> ResultSet:
    # Run the translated query against the real database
    query, params = native_query
    rows = connection.run(query, params)
    return ResultSet(rows=rows, source_module=self.get_manifest().name)

def execute_native(self, query: str, connection: Any) -> ResultSet:
    # Run a raw native query (from db.mydb("…"))
    errors = native_validator.validate(query)
    if errors:
        raise ValueError(f"Validation failed: {errors}")
    return self.execute(query, connection)

def validate_native_query(self, query: str) -> list[str]:
    return native_validator.security_check(query)
```

### Schema

```python
def get_schema_store(self) -> SchemaStore:
    return self._schema_store

def sync_schema_from_source(self, connection: Any) -> SchemaStore:
    self._schema_store = sync_full_schema(connection)
    return self._schema_store

def create_view(self, view_name: str, aliases: list, returns: Any, connection: Any) -> str:
    # Create a view in the database. Raise NotImplementedError if not supported.
    ...
```

## Step-by-Step Guide

### 1. ConnectionSchema

Define what configuration fields your module needs:

```python
# connection_schema.py
from uqal_core.config.connection_schema import ConnectionSchema

class MyDbConnectionSchema(ConnectionSchema):
    host: str = "localhost"
    port: int = 9000
```

### 2. Type Mapping

Map UQAL core types to your database's types:

```python
# type_mapping.py
CORE_TO_MYDB = {
    "int":      "INT",
    "float":    "FLOAT64",
    "varchar":  "STRING",
    "bool":     "BOOL",
    "date":     "DATE",
    "datetime": "TIMESTAMP",
}
```

### 3. Capabilities

Declare what grammar extension points your module contributes to:

```python
# capabilities.py
from uqal_core.module_interface import CapabilityManifest

MY_CAPABILITIES = CapabilityManifest(
    grammar_extensions={
        # "condition": ["my_custom_condition"],   # if you add grammar
    }
)
```

### 4. Translator

Implement `translate(ast_node)` which converts AST nodes into queries your
database understands. The most common nodes you'll handle:

- `DbTableCall` — `db.table.get_table(…)` / `get_row` / `get_value` / `insert_row` / `update` / `delete`
- `DbQueryBlock` — `db.query: …` blocks
- `DbWriteCall` — write operations

```python
# translator.py
from uqal_core.ast.nodes import DbTableCall

class MyDbTranslator:
    def translate(self, node):
        if isinstance(node, DbTableCall):
            return self._translate_table_call(node)
        raise NotImplementedError(f"Cannot translate {type(node).__name__}")

    def _translate_table_call(self, node: DbTableCall):
        query = f"SELECT * FROM {node.table}"
        # handle where, fields, command (get_row → LIMIT 1), …
        return query, {}
```

### 5. Native Validator

Block dangerous patterns in native queries:

```python
# native_validator.py
import re

_BLOCKED = [
    (re.compile(r"\bDROP\b", re.IGNORECASE), "DROP is not allowed."),
]

def security_check(query: str) -> list[str]:
    return [f"Security violation: {msg}" for pat, msg in _BLOCKED if pat.search(query)]

def syntax_check(query: str, connection=None) -> list[str]:
    if connection is None:
        return []
    # Use connection to validate syntax (e.g. EXPLAIN or dry-run)
    ...

def validate(query: str, connection=None) -> list[str]:
    errors = security_check(query)
    return errors if errors else syntax_check(query, connection)
```

### 6. Schema Sync

Discover your database structure and populate a `SchemaStore`:

```python
# schema_sync.py
from uqal_core.schema.schema_store import SchemaStore

def sync_full_schema(connection) -> SchemaStore:
    store = SchemaStore()
    tables = connection.list_tables()
    for table in tables:
        columns = connection.get_columns(table)
        store.add_table(table, {col.name: col.type for col in columns})
    return store
```

### 7. Grammar Extension (optional)

If your module needs new syntax (like Neo4j's relationship traversal), add
a `grammar_extension.lark` file and register an AST node handler:

```lark
# grammar_extension.lark
my_custom_syntax: NAME "=>" NAME
```

```python
# module.py
from uqal_core.ast.module_nodes import register_node_handler

def _handle_my_syntax(children):
    return MyCustomNode(source=str(children[0]), target=str(children[1]))

register_node_handler("my_custom_syntax", _handle_my_syntax)
```

See [Extension Modules](./extension-modules.md) for when this is needed.

## When to Use the Module Node Registry vs. String Convention

| Situation | Approach |
|-----------|----------|
| Your grammar rule maps cleanly to a core AST node | No registry needed — core transformer handles it |
| Your grammar rule produces structured data with named fields | Register a handler that returns a custom dataclass |
| Your grammar rule just produces a string value | No registry needed — use `__default__` passthrough |

The Neo4j `RelationshipTraversal` node is a good example of when a registry
handler is needed: `u PLACED o` produces three named fields
(`source_alias`, `relationship_type`, `target_alias`) that the translator
needs to access by name.

## Testing

Every module must pass the compliance suite:

```bash
uv run pytest tests/integration/test_module_compliance.py -v
```

The compliance suite verifies:
- All required `UQALModule` methods are implemented
- The grammar extension produces no rule name collisions
- The native command name is unique across loaded modules
- The type mapping covers all UQAL core types

Write unit tests for your translator and native validator. See the existing
`tests/unit/test_neo4j_translator.py` for patterns to follow.
