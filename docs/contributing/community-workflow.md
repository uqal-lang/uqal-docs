---
id: community-workflow
title: Community Module Workflow
sidebar_position: 5
---

# Community Module Workflow

Community modules live in a separate repository: **`uqal-modules`**.
This page describes how to contribute, how reviews work, and how
publishing and changelogs are handled automatically.

---

## Repository Structure

```
uqal-modules/
├── .github/
│   ├── workflows/
│   │   ├── validate-pr.yml       ← runs on every PR
│   │   └── publish-module.yml    ← runs on merge to main
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── cliff.toml                    ← changelog config
└── modules/
    ├── community.postgis/
    │   ├── module.json
    │   ├── __init__.py
    │   ├── grammar_extension.lark   (optional)
    │   └── docs/
    │       ├── index.md
    │       └── syntax.md
    └── community.clickhouse/
        └── ...
```

---

## Branch Strategy

```
main                              ← always stable, always published
  ↑  only dev/* or hotfix/*
dev/community.postgis             ← staging for your module
  ↑  only feat/*, fix/*, refactor/*, docs/*, test/*
feat/community.postgis/add-st-within
fix/community.postgis/null-geom
```

**All branches are automatically deleted after merge.**
GitHub setting: *Repository Settings → General → Automatically delete head branches.*

### Rules enforced by CI

| Source branch | Target branch | Allowed? |
|---------------|---------------|----------|
| `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*` | `dev/community.*` | ✓ |
| `dev/community.*`, `hotfix/*` | `main` | ✓ |
| `feat/*` directly | `main` | ✗ blocked |
| Files from a different module in `dev/community.postgis` | `main` | ✗ blocked |

No direct commits are allowed on `dev/*` or `main` — all changes must go through a pull request.

---

## Starting Work on a Module

```bash
# 1. Fork the repo and clone
git clone https://github.com/<you>/uqal-modules

# 2. Create your dev branch from main
git checkout -b dev/community.postgis

# 3. Create a feature branch from your dev branch
git checkout -b feat/community.postgis/add-st-within

# 4. Work, commit, push
git push origin feat/community.postgis/add-st-within

# 5. Open PR: feat/community.postgis/... → dev/community.postgis
```

Repeat steps 3–5 for each feature. **Do not touch the version in `module.json`
— it is managed automatically by CI.** When the module is ready, open the
final PR: `dev/community.postgis` → `main`.

---

## Pull Request Rules

### PR Title Format

All PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

| Type | Changelog section | When to use |
|------|-------------------|-------------|
| `feat` | Added | New functionality |
| `fix` | Fixed | Bug fix |
| `breaking` | Breaking Changes | Incompatible change |
| `refactor` | Changed | Internal restructure, no behavior change |
| `docs` | *(hidden)* | Documentation only |
| `test` | *(hidden)* | Tests only |
| `chore` | *(hidden)* | Config, CI, maintenance |
| `release` | *(triggers publish)* | Version bump PR from dev → main |

The **scope** must match the module name: `feat(community.postgis): ...`

### PR Description Template

```
## What

Short explanation of the change.

## Why

Motivation — bug, missing feature, user request.

## Notes for reviewer (optional)

Anything the reviewer should pay attention to.
```

The PR description is for reviewers. It does not appear in the changelog.
The PR **title** is the changelog entry.

---

## Approval

- Every PR to `main` requires approval from at least one **core maintainer**.
- Core maintainers are listed in `.github/CODEOWNERS`.
- No self-approval (GitHub enforces this).
- PRs that touch `.github/` require maintainer approval and cannot be
  approved by module authors.

---

## What CI Checks (validate-pr.yml)

On every PR:

1. **Source branch check** — source must follow allowed branch pattern
2. **PR title format** — must match Conventional Commits with valid type and scope
3. **Scope matches module** — scope in title must match the changed module directory
4. **Module isolation** — only one module directory may be changed per PR
5. **Docs structure** — `docs/index.md` and `docs/syntax.md` must exist with required sections
6. **Interface compatibility** — `compatible_with` in `module.json` must match current `INTERFACE_VERSION`
7. **Tests** — `uv run pytest` must pass

---

## Automatic Versioning

**You never need to set a version number manually.** CI calculates the next
version automatically based on the PR title type every time a `dev/*` branch
is merged to `main`.

| PR title type | Version bump | Example |
|---------------|-------------|---------|
| `breaking` | Major (`1.0.0 → 2.0.0`) | Incompatible syntax change |
| `feat` | Minor (`0.1.0 → 0.2.0`) | New command or syntax |
| `fix`, `refactor`, `chore` | Patch (`0.1.1 → 0.1.2`) | Bug fix, internal change |
| `docs`, `test` | No publish | Docs or test only — skipped |

### How it works

```
1. Read last git tag:    community.postgis-v0.1.3
2. Read PR title type:   feat  →  MINOR bump
3. Calculate new version: 0.2.0
4. Write to module.json: "version": "0.2.0"
5. Commit back to main:
     chore(community.postgis): bump version to 0.2.0 [skip ci]
6. Create tag:           community.postgis-v0.2.0
7. Build and publish
8. Generate changelog
```

The `[skip ci]` marker on the version-bump commit prevents CI from
triggering itself in a loop.

## Publishing (publish-module.yml)

Triggered automatically on every merge to `main`. Behaviour depends on what changed:

### Docs-only change

If **only files inside `docs/`** were changed — no code, no `module.json`, no grammar:

```
✓ Updated docs are deployed to the documentation site
✗ No version bump
✗ No PyPI publish
✗ No changelog entry
✗ No git tag
```

### Code change (everything else)

If any non-docs file changed:

1. Detect which module was changed
2. Determine version bump from PR title type (`feat` → minor, `fix` → patch, `breaking` → major)
3. Calculate new version from last git tag
4. Write new version to `module.json`
5. Commit version bump to `main` with `[skip ci]`
6. Create git tag: `community.postgis-v0.2.0`
7. Publish to PyPI if configured (see below)
8. Run git-cliff to generate the changelog
9. Deploy updated docs to the documentation site

---

## Installing a Community Module

There are two ways to install a community module — with or without PyPI.

### Without PyPI (git install)

Works immediately after a module is merged — no PyPI account needed.

```bash
# Latest version
uv add "git+https://github.com/uqal-lang/uqal-modules#subdirectory=modules/community.postgis"

# Pinned to a specific version (uses git tag created by CI)
uv add "git+https://github.com/uqal-lang/uqal-modules@community.postgis-v0.2.0#subdirectory=modules/community.postgis"
```

### With PyPI

If the module author has set up PyPI publishing:

```bash
uv add uqal-postgis
```

Then register the module:

```bash
uqal add-module community.postgis
```

And declare it on the connection:

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

---

## PyPI Publishing (optional)

PyPI publishing is **opt-in**. You are responsible for setting it up for your own module.
If you skip it, users can still install your module via the git URL above.

### Step 1 — Create a PyPI account

Register at [pypi.org](https://pypi.org/account/register/).

### Step 2 — Set up Trusted Publishing

Trusted Publishing lets CI publish to PyPI without storing an API key anywhere.

1. Log in to [pypi.org](https://pypi.org)
2. Go to **Account settings → Publishing → Add a new pending publisher**
3. Fill in:

| Field | Value |
|-------|-------|
| Package name | `uqal-<yourmodule>` (e.g. `uqal-postgis`) |
| Owner | `uqal-lang` |
| Repository | `uqal-modules` |
| Workflow name | `publish-module.yml` |
| Environment | *(leave empty)* |

4. Save — PyPI now trusts the CI workflow to publish under this package name.

### Step 3 — Add `pypi_package` to module.json

```json
{
  "name": "community.postgis",
  "version": "0.1.0",
  "compatible_with": 1,
  "type": "extension",
  "extends": "standard.postgresql",
  "description": "PostGIS geospatial syntax for PostgreSQL connections.",
  "author": "Your Name",
  "repository": "https://github.com/uqal-lang/uqal-modules",
  "pypi_package": "uqal-postgis"
}
```

The CI reads `pypi_package` from `module.json`. If the field is missing, the PyPI publish step is skipped automatically.

### First publish

The first time your module merges to `main`, CI will:
1. Build the package
2. Publish it to PyPI under the name you registered
3. The package is now installable via `uv add uqal-postgis`

All subsequent merges publish new versions automatically.

---

## Changelog

The changelog is generated automatically by [git-cliff](https://git-cliff.org/).
It reads all squash-merge commit messages since the last version tag and groups
them by type:

```markdown
## community.postgis v0.2.0 — 2024-03-15

### Breaking Changes
- Rename spatial_ref to srid (#126)

### Added
- Add ST_Within geometry filter (#123)
- Add ST_Distance support (#128)

### Fixed
- Handle null geometry in WHERE clause (#124)
```

Each entry links to its PR on GitHub. `docs`, `test`, and `chore` commits
are excluded from the user-facing changelog.
