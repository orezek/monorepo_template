# Monorepo Packages

Shared packages in `packages/` provide reusable configuration and runtime utilities for apps in this repository.

## Current Packages

| Directory                    | Package Name              | Purpose                                |
| ---------------------------- | ------------------------- | -------------------------------------- |
| `packages/env-config`        | `@repo/env-config`        | Typed environment parsing with `zod`.  |
| `packages/eslint-config`     | `@repo/eslint-config`     | Shared ESLint Flat Config presets.     |
| `packages/typescript-config` | `@repo/typescript-config` | Shared TypeScript base configurations. |

## Package Management Rules

- Use `pnpm` only.
- Use `workspace:*` for internal package dependencies.
- Use `catalog:` for shared external dependencies defined in `pnpm-workspace.yaml`.
- Run installs from repository root: `pnpm install`.

## Consuming Internal Packages

Add internal packages to app/package `package.json` using `workspace:*`.

Example:

```json
{
  "dependencies": {
    "@repo/env-config": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Creating a New Package

Default workflow from repo root:

```bash
pnpm scaffold:package <name>
```

Supported package types:

- `node-lib` (default)
- `react-library` via `--type react-library`
- `config-only` via `--type config-only`

Example:

```bash
pnpm scaffold:package logger
pnpm scaffold:package ui --type react-library
```

Then review:

1. `package.json` metadata, exports, and dependencies.
2. Generated source/config entrypoints.
3. Run `pnpm install` from repo root so the new workspace gets local binaries and workspace links.
4. Workspace-local `.gitignore` so package-specific generated artifacts are ignored.
5. Shared configs and scripts aligned to repository standards.

Recommended baseline:

```json
{
  "name": "@repo/<name>",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.13.1",
  "engines": { "node": ">=24" },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "eslint": "catalog:",
    "typescript": "catalog:"
  }
}
```

`tsconfig.json` should usually extend one of:

- `@repo/typescript-config/node-lib.json`
- `@repo/typescript-config/react-library.json`

## Validation

From repo root:

```bash
pnpm lint
pnpm check-types
pnpm build
```

For source packages (`node-lib`, `react-library`), also run:

```bash
pnpm -C packages/<name> lint
pnpm -C packages/<name> check-types
pnpm -C packages/<name> build
```

For `config-only` packages, run package-level checks only if scripts exist.
