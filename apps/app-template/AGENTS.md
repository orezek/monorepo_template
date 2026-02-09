# App Template Agent Instructions

These instructions extend, but never replace, the repository root rules.

## Inheritance (Mandatory)

- Always apply root `AGENTS.md` first.
- Always apply `.aiassistant/rules/monorepo.md`.
- If this file conflicts with root rules, root rules win.

## Scope

- This file applies only to `apps/app-template/**`.
- Do not treat these rules as global to other apps or packages.

## App-Specific Constraints

- Keep this app as a reusable scaffold template for future apps.
- Do not delete `apps/app-template`.
- Preserve script conventions in `apps/app-template/package.json`: `build` -> `tsc`.
- Preserve script conventions in `apps/app-template/package.json`: `start` -> `node dist/app.js`.
- Preserve script conventions in `apps/app-template/package.json`: `dev` -> `tsx watch src/app.ts`.
- Keep dependency style aligned with repo standards: internal packages as `workspace:*`.
- Keep dependency style aligned with repo standards: external shared dependencies as `catalog:`.
- Maintain TypeScript config inheritance via `@repo/typescript-config/node-lib.json`.
- Keep ESLint flat config extending `@repo/eslint-config`.
- Keep env loading type-safe through `@repo/env-config` + schema validation.

## When Updating This Template

- Ensure changes are template-safe and reusable by newly scaffolded apps.
- Update `apps/app-template/README.md` when behavior or usage changes.
- Avoid adding app-specific business logic that would not generalize to new apps.
