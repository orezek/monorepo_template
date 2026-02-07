# Agent Instructions

This repository uses project-specific AI guidance.

## Required Rule Source

- Primary rules file: `.aiassistant/rules/monorepo.md`
- Agents working in this repository must apply those rules for code generation, edits, and workflow guidance.

## Precedence

- System and tool safety instructions always take precedence.
- Then follow this file and `.aiassistant/rules/monorepo.md`.
- If there is a conflict with repository reality, prefer the actual repository configuration (`package.json`, `turbo.json`, `pnpm-workspace.yaml`) and update docs/rules to match.

## Scope

- These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them for a subdirectory.
