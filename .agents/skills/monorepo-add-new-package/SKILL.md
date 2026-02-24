---
name: monorepo-add-new-package
description: Create a new shared package in this pnpm + Turborepo workspace using the package scaffold flow (`pnpm scaffold:package <name>`) with correct `packages/<name>` layout, `@repo/<name>` naming, catalog/workspace dependency policy, workspace `.gitignore`, TypeScript + ESLint setup (when applicable), docs updates, and validation commands. Trigger when a user asks to add, scaffold, generate, or bootstrap a package under `packages/` or introduces a new `@repo/*` internal library.
---

# Add New Package

Use this workflow to add a package that follows repository rules and current scaffolding behavior.

## 1) Collect Required Inputs

Confirm these before creating files:

- Directory name in kebab-case (target path: `packages/<name>`)
- Package name in `package.json`: `@repo/<name>`
- Package type:
  - `node-lib` (default for shared runtime utilities)
  - `react-library` (for UI/shared React code)
  - `config-only` (for config exports without a TS build pipeline)
- Short description and intended export/API surface
- Required dependencies (internal and external)

If naming, package type, or intended exports are unclear, ask before scaffolding.

## 2) Use Package Scaffold Workflow (Default)

For new packages under `packages/`, run from repo root:

```bash
pnpm scaffold:package <name>
```

Optional type selection:

```bash
pnpm scaffold:package <name> --type node-lib
pnpm scaffold:package <name> --type react-library
pnpm scaffold:package <name> --type config-only
```

Optional description:

```bash
pnpm scaffold:package <name> --description "Short package description"
```

The scaffold script creates a workspace-local `.gitignore` and generates a type-aware baseline.
After scaffolding a new package workspace, run `pnpm install` from repo root before package-local commands.

## 3) Review and Adjust Scaffold Output

### A. `node-lib` / `react-library`

The scaffold generates a standard source package baseline including:

- `packages/<name>/package.json`
- `packages/<name>/tsconfig.json`
- `packages/<name>/eslint.config.js`
- `packages/<name>/src/index.ts`
- `packages/<name>/README.md`
- `packages/<name>/.gitignore`

Review and adjust:

- `description`, `exports`, and `files` in `package.json`
- `dependencies` and `devDependencies` (follow `workspace:*` and `catalog:` policy)
- `tsconfig.json` inheritance (`node-lib` vs `react-library`)
- `src/index.ts` public API exports
- `.gitignore` if package tooling adds local artifacts (for example test reports)

### B. `config-only`

The scaffold generates a minimal config-package baseline (`index.js`, `package.json`, `README.md`, `.gitignore`).

Review and adjust carefully:

- Replace `index.js` placeholder export with the actual config surface
- Expand `exports` in `package.json` if you need multiple entrypoints/files
- Add scripts only when they are meaningful for the config package type
- Add package-specific ignore entries if local tooling generates artifacts

## 4) Manual Fallback (Allowed for Specialized Packages)

Manual scaffolding is allowed when the package needs a highly specialized layout (for example complex config exports) and the generated scaffold would be misleading.

Minimum manual requirements:

- Create package under `packages/<name>`
- Name package `@repo/<name>`
- Add a workspace-local `.gitignore` aligned to package artifacts
- Follow dependency policy (`workspace:*`, `catalog:`)
- Keep imports across workspaces via `@repo/*` only

## 5) Apply Dependency Policy

Follow these rules exactly:

- Use `pnpm` only
- Use `workspace:*` for internal packages (`@repo/*`)
- Use `catalog:` for external dependencies already listed in `pnpm-workspace.yaml`
- If an external dependency is missing from catalogs, add it to `pnpm-workspace.yaml` first, then reference it with `catalog:`
- Update `pnpm-lock.yaml` only when the dependency graph changes

## 6) Enforce Monorepo Boundaries and Workspace Hygiene

- Keep package in `packages/<name>`
- Import shared internal code via `@repo/*` package imports
- Never use deep relative imports across packages (forbidden: `../../packages/...`)
- Ensure `.gitignore` covers generated/local artifacts (`node_modules/`, `.turbo/`, `*.tsbuildinfo`, and type-specific outputs such as `dist/`)

## 7) Update Documentation

After adding a new package, update:

- `packages/README.md` package table/workflow guidance when affected
- `README.md` if package creation workflow or project structure references change

If release metadata is involved, keep `CHANGELOG.md` synchronized.

## 8) Validate Before Completion

Run at minimum:

```bash
pnpm format
pnpm lint
pnpm check-types
```

For source packages (`node-lib`, `react-library`), run package-level checks:

```bash
pnpm install
pnpm -C packages/<name> lint
pnpm -C packages/<name> check-types
pnpm -C packages/<name> build
```

For `config-only` packages, run package-level checks only if scripts exist.

Run affected tests if the changed area has test coverage.

## 9) Done Checklist

Before finishing, confirm:

- Package exists at `packages/<name>` and is named `@repo/<name>`
- Scaffold flow was used (or manual fallback was justified)
- `.gitignore` exists and matches the package type
- Dependencies follow `workspace:*` and `catalog:` policy
- Docs are updated when workflows/structure changed
- Formatting, linting, and type checks pass
- No runtime artifacts are committed (for example `.turbo/**`)
