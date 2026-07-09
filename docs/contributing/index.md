---
id: index
title: Contributing to UQAL
sidebar_label: Contributing
sidebar_position: 1
---

# Contributing to UQAL

UQAL is split across three repositories. Each has different rules about who can contribute and how.

---

## Which repo should I contribute to?

| I want to… | Repo | Open to everyone? |
|------------|------|-------------------|
| Build a new database module | [uqal-modules](https://github.com/uqal-lang/uqal-modules) | ✓ Yes |
| Fix a bug in an existing community module | [uqal-modules](https://github.com/uqal-lang/uqal-modules) | ✓ Yes |
| Improve documentation | [uqal-docs](https://github.com/uqal-lang/uqal-docs) | via PR |
| Work on the core engine (parser, AST, CLI) | [uqal-core](https://github.com/uqal-lang/uqal-core) | ✗ Team only |

---

## uqal-modules — Open Community Contributions

Anyone can contribute a community module or fix bugs in existing ones.

**How it works:**

1. Fork [uqal-lang/uqal-modules](https://github.com/uqal-lang/uqal-modules)
2. Create a staging branch: `dev/community.<name>`
3. Build your module in feature branches: `feat/community.<name>/...`
4. Open a PR from `dev/community.<name>` to `main`
5. A maintainer reviews and approves before merge

All PRs are validated automatically by CI (structure, tests, coverage, docs).
A maintainer approval is always required before anything is merged.

See the full guide: [Community Workflow](./community-workflow.md)

---

## uqal-core — Team Only

`uqal-core` is the engine that all modules run on. Development is restricted to members of the **UQAL team** to ensure stability and backwards compatibility.

**Pull requests from outside the team will not be approved and will be closed.**

If you want to work on `uqal-core`:

1. Open an issue on [uqal-core](https://github.com/uqal-lang/uqal-core/issues) describing what you want to work on
2. The maintainers will decide whether to invite you to the team as a `developer`
3. Once added, you can create branches from `dev` and open PRs — every PR still requires maintainer approval before merge

**Why is this restricted?**  
Changes to `uqal-core` affect every module. A breaking change in the parser or module interface can break all community modules at once. We keep the contributor circle small to control that risk.

---

## uqal-docs — Maintainer Managed

Documentation is updated automatically when modules are published. Manual changes (fixing typos, improving wording) are handled by maintainers.

If you spot an error in the docs, open an issue on [uqal-docs](https://github.com/uqal-lang/uqal-docs/issues) and a maintainer will fix it.

---

## Reporting Bugs

- Bug in a community module → [uqal-modules issues](https://github.com/uqal-lang/uqal-modules/issues)
- Bug in the core engine → [uqal-core issues](https://github.com/uqal-lang/uqal-core/issues)
- Security vulnerability → see [SECURITY.md](https://github.com/uqal-lang/uqal-core/blob/main/SECURITY.md)

---

## Where to Start

- [Architecture](./architecture.md) — how UQAL works internally
- [Module Development](./module-development.md) — build a new database module
- [Extension Modules](./extension-modules.md) — add capabilities to an existing module
- [Module Standards](./module-standards.md) — required structure, `module.json` schema, test requirements
- [Community Workflow](./community-workflow.md) — branch strategy, PR rules, auto-versioning, publishing
