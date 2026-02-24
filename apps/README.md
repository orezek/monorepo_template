# Adding a New Application to the Monorepo

Use the scaffold workflow by default.

## Default Workflow (Required)

Create a new Node/console app from repo root:

```bash
pnpm scaffold:app <app-name>
```

Example:

```bash
pnpm scaffold:app billing-service
```

What this gives you:

- App created from `apps/app-template`.
- Build artifacts are excluded (`node_modules`, `dist`, `.turbo`, `tsconfig.tsbuildinfo`).
- `AGENTS.md` is copied so app-local agent extensions are preserved.
- Workspace `.gitignore` baseline is copied for app-local generated/runtime artifacts.
- `package.json` name is updated to your app name.

Before running app-local scripts, run `pnpm install` from repo root so the new workspace gets local binaries and workspace links.

## Validate the New App

From repo root, run:

```bash
pnpm install
```

Then run either form:

```bash
# by directory
pnpm -C apps/<app-name> lint
pnpm -C apps/<app-name> check-types
pnpm -C apps/<app-name> build

# by workspace name
pnpm -F <app-name> lint
pnpm -F <app-name> check-types
pnpm -F <app-name> build
```

## Fallback-Only Manual Flow

Use manual folder copy only if the scaffold script is unavailable or explicitly not desired for a task.

```bash
cp -R apps/app-template apps/<app-name>
rm -rf apps/<app-name>/node_modules \
       apps/<app-name>/dist \
       apps/<app-name>/.turbo \
       apps/<app-name>/tsconfig.tsbuildinfo
```

Then update at minimum:

- `apps/<app-name>/package.json` (`name`, description, author as needed)
- `apps/<app-name>/README.md`
- `apps/<app-name>/.gitignore` (if framework/tooling local artifacts differ from the template baseline)
- `apps/<app-name>/.env`
- `apps/<app-name>/src/app.ts`

## Notes

- Apps are auto-included by `pnpm-workspace.yaml` via `apps/*`.
- Keep dependency conventions: internal `workspace:*`, shared external dependencies via `catalog:`.
