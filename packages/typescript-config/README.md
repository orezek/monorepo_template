# @repo/typescript-config

Shared TypeScript configurations for the monorepo. This package provides consistent build settings for different environments (Node.js libraries, Next.js apps, and React component libraries).

## Usage

### 1. Installation

Install the package as a dev dependency in your workspace:

````bash
pnpm add -D @repo/typescript-config --filter <target-package>


### 2. Extension

Create a `tsconfig.json` in your package root and extend the appropriate config.

**For a Generic Node.js Library:**

```json
{
  "extends": "@repo/typescript-config/node-lib.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}

````

**For a React Component Library:**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test", "**/*.stories.tsx"]
}
```

**For a Next.js Application:**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Available Configurations

### 1. Base Configuration (`base.json`)

The foundation for all other configs. It defines the strict quality checks and language features common to the entire repository.

| Option                     | Value      | Explanation                                                                                                                     |
| -------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `strict`                   | `true`     | Enables all strict type-checking options (e.g., `noImplicitAny`, `strictNullChecks`).                                           |
| `skipLibCheck`             | `true`     | Skips type checking of declaration files (`.d.ts`) in `node_modules` to improve build speed.                                    |
| `resolveJsonModule`        | `true`     | Allows importing `.json` files as modules.                                                                                      |
| `noUncheckedIndexedAccess` | `true`     | Adds `undefined` to any index signature access (e.g., `arr[0]` is potentially `undefined`), preventing runtime crashes.         |
| `isolatedModules`          | `true`     | Ensures each file can be safely transpiled without relying on other files (required by Bundlers like Vite/esbuild).             |
| `moduleDetection`          | `"force"`  | Treats all files as modules, even if they don't have imports/exports, preventing global scope pollution.                        |
| `target`                   | `"ES2022"` | Compiles code to ECMAScript 2022 syntax (supports static class blocks, top-level await).                                        |
| `incremental`              | `true`     | Saves compilation info to `.tsbuildinfo` to speed up subsequent builds. Warning! It needs to be exluded from the build process. |

### 2. Node.js Library (`node-lib.json`)

**Use for:** Backend libraries, utilities, or CLI tools running in Node.js.

- **Extends:** `base.json`
- **Environment:** Node.js (No DOM access)

| Key Setting        | Value        | Why?                                                                                                                           |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `module`           | `"NodeNext"` | Uses the modern Node.js module system. Respects `package.json` "exports" and supports both ESM (`.mjs`) and CommonJS (`.cjs`). |
| `moduleResolution` | `"NodeNext"` | Mimics exactly how Node.js finds files (strict extension rules).                                                               |
| `lib`              | `["ES2022"]` | **Excludes DOM**. Prevents accidental usage of `window` or `document` in backend code.                                         |
| `types`            | `["node"]`   | Includes Node.js built-in types (requires `@types/node`).                                                                      |
| `composite`        | `true`       | Enables "Project References". Allows this package to be built independently and referenced by other parts of the monorepo.     |
| `declaration`      | `true`       | Generates `.d.ts` files for consumers.                                                                                         |
| `declarationMap`   | `true`       | Generates `.d.ts.map` files, allowing consumers to "Go to Definition" and land in your original source TS file.                |

### 3. React Library (`react-library.json`)

**Use for:** UI component libraries (e.g., a design system) intended to be bundled by consumers.

- **Extends:** `base.json`
- **Environment:** Browser (via Bundler)

| Key Setting        | Value          | Why?                                                                                                                                      |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `module`           | `"ESNext"`     | Emits modern ES modules. Leaves import statements alone for the bundler to handle.                                                        |
| `moduleResolution` | `"Bundler"`    | A lenient resolution mode designed for Vite/Webpack. Allows importing files without extensions and resolves paths similarly to a bundler. |
| `jsx`              | `"react-jsx"`  | Automatic JSX transformation (React 17+). No need to `import React from 'react'`.                                                         |
| `lib`              | `["DOM", ...]` | **Includes DOM**. Adds browser APIs (Window, HTMLElement) to the global scope.                                                            |
| `composite`        | `true`         | Enables Project References for efficient monorepo builds.                                                                                 |

### 4. Next.js App (`nextjs.json`)

**Use for:** Next.js applications (pages/app directory).

- **Extends:** `base.json`
- **Environment:** Universal (Server + Client)

| Key Setting        | Value                  | Why?                                                                                                                                 |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `noEmit`           | `true`                 | **Critical.** Next.js uses its own compiler (SWC). TypeScript is used _only_ for type checking, not for generating `.js` files.      |
| `plugins`          | `[{ "name": "next" }]` | Enables the Next.js TypeScript plugin for better autocomplete and error reporting in `next.config.js` and other Next-specific files. |
| `jsx`              | `"preserve"`           | Keeps JSX syntax (`<div />`) intact so Next.js's SWC compiler can optimize it later.                                                 |
| `moduleResolution` | `"Bundler"`            | Matches the way Next.js resolves modules internally.                                                                                 |
| `allowJs`          | `true`                 | Allows JavaScript files to coexist with TypeScript files in the project.                                                             |

## Troubleshooting

**Error: "Cannot find name 'document'" in a Node library**

- **Cause:** You are trying to use browser APIs in a package extending `node-lib.json`.
- **Fix:** If this package _should_ run in the browser, extend `react-library.json` instead. If it is backend-only, `document` is not available.

**Error: "The file is in the program because..."**

- **Cause:** You likely forgot to `exclude` `node_modules` or `dist` in your local `tsconfig.json`.
- **Fix:** Ensure your `exclude` array is correct:

```json
"exclude": ["node_modules", "dist", "test", "**/*.test.ts"]
```
