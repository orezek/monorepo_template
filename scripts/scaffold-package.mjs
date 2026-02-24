#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const VALID_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PACKAGE_TYPES = new Set(['node-lib', 'react-library', 'config-only']);

function printUsage() {
  console.log('Usage: pnpm scaffold:package <name> [--type <node-lib|react-library|config-only>]');
  console.log('       pnpm scaffold:package <name> [--description "<text>"]');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm scaffold:package logger');
  console.log('  pnpm scaffold:package ui --type react-library');
  console.log('  pnpm scaffold:package commitlint-config --type config-only');
}

function fail(message) {
  console.error(message);
  console.error('');
  printUsage();
  process.exit(1);
}

function parseArgs(argv) {
  let name;
  let type = 'node-lib';
  let description;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      return { help: true };
    }

    if (arg === '--type') {
      const value = argv[index + 1];
      if (!value) fail('Missing value for --type.');
      type = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--type=')) {
      type = arg.slice('--type='.length);
      continue;
    }

    if (arg === '--description') {
      const value = argv[index + 1];
      if (!value) fail('Missing value for --description.');
      description = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--description=')) {
      description = arg.slice('--description='.length);
      continue;
    }

    if (arg.startsWith('-')) {
      fail(`Unknown option: ${arg}`);
    }

    if (name) {
      fail(`Unexpected extra argument: ${arg}`);
    }

    name = arg;
  }

  return { help: false, name, type, description };
}

function toTitle(text) {
  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function buildGitignore(packageType) {
  const lines = ['node_modules/', '.turbo/'];

  if (packageType !== 'config-only') {
    lines.push('dist/');
  }

  lines.push('*.tsbuildinfo', 'coverage/');

  return `${lines.join('\n')}\n`;
}

function buildReadme(dirName, packageType, description) {
  const title = toTitle(dirName);
  const typeLabel =
    packageType === 'react-library'
      ? 'React library'
      : packageType === 'config-only'
        ? 'config-only package'
        : 'Node library';

  return `# @repo/${dirName}

${description || `${typeLabel} for the monorepo.`}

## Package Type

- ${typeLabel}

## Usage

Replace this README with package-specific documentation once the API/export surface is defined.
`;
}

function buildSourcePackageFiles({ dirName, packageType, description }) {
  const packageName = `@repo/${dirName}`;
  const tsconfigExtends =
    packageType === 'react-library'
      ? '@repo/typescript-config/react-library.json'
      : '@repo/typescript-config/node-lib.json';

  const packageJson = {
    name: packageName,
    version: '1.0.0',
    description:
      description || `Shared ${packageType === 'react-library' ? 'React' : 'Node'} package for the monorepo.`,
    private: true,
    type: 'module',
    packageManager: 'pnpm@10.13.1',
    engines: { node: '>=24' },
    exports: {
      '.': {
        import: './dist/index.js',
        types: './dist/index.d.ts',
      },
    },
    types: './dist/index.d.ts',
    files: ['dist', 'README.md', 'LICENSE'],
    scripts: {
      build: 'tsc -p tsconfig.json',
      dev: 'tsc -w -p tsconfig.json',
      lint: 'eslint . --max-warnings 0',
      'check-types': 'tsc -p tsconfig.json --noEmit',
    },
    dependencies: {},
    devDependencies: {
      '@repo/eslint-config': 'workspace:*',
      '@repo/typescript-config': 'workspace:*',
      '@types/node': 'catalog:',
      eslint: 'catalog:',
      typescript: 'catalog:',
    },
  };

  const tsconfig = {
    extends: tsconfigExtends,
    compilerOptions: {
      outDir: 'dist',
      rootDir: 'src',
      types: ['node'],
      verbatimModuleSyntax: true,
    },
    include: ['src'],
    exclude: ['node_modules', 'dist', 'test', '**/*.test.ts'],
  };

  const eslintConfig = `import { config as base } from '@repo/eslint-config/base';\nexport default [...base];\n`;
  const entrySource = `export {};\n`;

  return {
    '.gitignore': buildGitignore(packageType),
    'README.md': buildReadme(dirName, packageType, description),
    'package.json': `${JSON.stringify(packageJson, null, 2)}\n`,
    'tsconfig.json': `${JSON.stringify(tsconfig, null, 2)}\n`,
    'eslint.config.js': eslintConfig,
    'src/index.ts': entrySource,
  };
}

function buildConfigOnlyPackageFiles({ dirName, description }) {
  const packageJson = {
    name: `@repo/${dirName}`,
    version: '1.0.0',
    description: description || 'Shared config-only package for the monorepo.',
    private: true,
    type: 'module',
    packageManager: 'pnpm@10.13.1',
    engines: { node: '>=24' },
    exports: {
      '.': './index.js',
    },
    files: ['index.js', 'README.md', 'LICENSE'],
  };

  const indexJs = `// Replace with the actual config export surface for this package.\nexport default {};\n`;

  return {
    '.gitignore': buildGitignore('config-only'),
    'README.md': buildReadme(dirName, 'config-only', description),
    'package.json': `${JSON.stringify(packageJson, null, 2)}\n`,
    'index.js': indexJs,
  };
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printUsage();
    return;
  }

  if (!parsed.name) {
    fail('Missing package name.');
  }

  if (!VALID_NAME.test(parsed.name)) {
    fail(`Invalid package name "${parsed.name}". Use kebab-case (letters, numbers, dashes).`);
  }

  if (!PACKAGE_TYPES.has(parsed.type)) {
    fail(
      `Invalid package type "${parsed.type}". Valid values: ${Array.from(PACKAGE_TYPES).join(', ')}.`,
    );
  }

  const repoRoot = process.cwd();
  const targetDir = path.join(repoRoot, 'packages', parsed.name);

  try {
    await mkdir(targetDir);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      console.error(`Target already exists: packages/${parsed.name}`);
      process.exit(1);
    }

    throw error;
  }

  const files =
    parsed.type === 'config-only'
      ? buildConfigOnlyPackageFiles({
          dirName: parsed.name,
          description: parsed.description,
        })
      : buildSourcePackageFiles({
          dirName: parsed.name,
          packageType: parsed.type,
          description: parsed.description,
        });

  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(targetDir, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf8');
  }

  console.log(`Created packages/${parsed.name} (${parsed.type}).`);
  console.log('Next steps:');
  console.log('1) Review generated metadata and exports');
  console.log('2) pnpm install');

  if (parsed.type === 'config-only') {
    console.log(`3) Customize packages/${parsed.name}/index.js (or replace with your config file layout)`);
    console.log(`4) Update packages/${parsed.name}/README.md`);
  } else {
    console.log(`3) pnpm -C packages/${parsed.name} lint`);
    console.log(`4) pnpm -C packages/${parsed.name} check-types`);
    console.log(`5) pnpm -C packages/${parsed.name} build`);
  }
}

await main();
