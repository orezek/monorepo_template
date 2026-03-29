import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { URL } from 'url'; // Built-in Node.js module
import { type z } from 'zod';

/**
 * Loads and validates environment variables from .env files.
 *
 * @param schema - The Zod schema to validate against.
 * @param importMetaUrl - Pass `import.meta.url` from the calling file.
 * @returns The validated, type-safe environment object.
 */
export function loadEnv<T extends z.ZodTypeAny>(schema: T, importMetaUrl: string): z.infer<T> {
  // Resolve the app directory from the caller path.
  const appEnvDir = path.dirname(new URL(importMetaUrl).pathname);

  // Use NODE_ENV if defined; default to development.
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Load env files with increasing override priority.
  const envFiles = [
    path.resolve(appEnvDir, '..', '.env'), // 1. Base .env
    path.resolve(appEnvDir, '..', `.env.${NODE_ENV}`), // 2. .env.development or .env.production
    path.resolve(appEnvDir, '..', '.env.local'), // 3. .env.local (highest priority)
  ];

  // Merge values from env files first so later files override earlier files
  // without ever clobbering runtime-provided process.env values.
  const fileEnv: Record<string, string> = {};

  envFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const parsedFile = dotenv.parse(fs.readFileSync(filePath));

      Object.assign(fileEnv, parsedFile);
    }
  });

  Object.entries(fileEnv).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });

  // Validate loaded values against the provided schema.
  const parsedEnv = schema.safeParse(process.env);

  if (!parsedEnv.success) {
    const errors = parsedEnv.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment variable validation failed:\n${errors}`);
  }

  return parsedEnv.data;
}
