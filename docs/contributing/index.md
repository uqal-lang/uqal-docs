---
id: index
title: Contributing to UQAL
sidebar_label: Contributing
sidebar_position: 1
---

# Contributing to UQAL

UQAL is an open-source project. Contributions are welcome in any form:
bug reports, new features, documentation improvements, and — most
importantly — new database modules.

## Ways to Contribute

**Report a bug** — Open an issue on GitHub. Include the UQAL version,
the query that failed, and the error message.

**Fix a bug** — Check the open issues labeled `bug`. Fork the repo,
fix it, open a pull request.

**Build a database module** — The most impactful contribution. If you use
a database that UQAL doesn't support yet, you can build a module for it.
See [Module Development](./module-development.md).

**Improve documentation** — Every page has an "Edit this page" link.
Documentation changes can be submitted as pull requests directly from
the browser.

## Development Setup

```bash
git clone https://github.com/uqal/uqal
cd uqal/uqal-core
uv sync
uv run pytest tests/ -v
```

All tests must pass before opening a pull request.

## Pull Request Guidelines

- One logical change per PR
- All existing tests must pass: `uv run pytest tests/ -v`
- New modules must pass the compliance suite:
  `uv run pytest tests/integration/test_module_compliance.py -v`
- No breaking changes to the public UQAL syntax without discussion in an issue first

## Naming Conventions

| Scope         | Prefix       | Example                     |
|---------------|--------------|-----------------------------|
| Built-in      | `standard.*` | `standard.postgresql`       |
| Community     | `community.*`| `community.clickhouse`      |
| Private/Local | `local.*`    | `local.mycompany_db`        |

## Where to Start

- [Architecture](./architecture.md) — understand how UQAL works internally
- [Module Development](./module-development.md) — build a new database module
- [Extension Modules](./extension-modules.md) — add capabilities to existing modules
- [Module Standards](./module-standards.md) — module types, `module.json` schema, required documentation structure
- [Community Workflow](./community-workflow.md) — branch strategy, PR rules, publishing, changelog
