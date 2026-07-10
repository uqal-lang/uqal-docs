---
id: index
title: Community Modules
sidebar_label: Overview
sidebar_position: 1
---

# Community Modules

Community modules are built and maintained by the UQAL community.
They extend UQAL with support for additional databases or add
capabilities to existing modules.

<!-- COMMUNITY-MODULES-LIST -->

No community modules yet. Be the first to contribute!

<!-- /COMMUNITY-MODULES-LIST -->

## Building a Community Module

Interested in contributing? Start here:

- [Module Standards](../../contributing/module-standards.md) — required structure, `module.json` schema, documentation format
- [Module Development](../../contributing/module-development.md) — step-by-step implementation guide
- [Extension Modules](../../contributing/extension-modules.md) — how to extend an existing module
- [Community Workflow](../../contributing/community-workflow.md) — branch strategy, PR rules, publishing

## Installing Community Modules

Once a community module is published:

```bash
uv add uqal-postgis
uqal add-module community.postgis
```

Then declare it on the connection that should use it:

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
