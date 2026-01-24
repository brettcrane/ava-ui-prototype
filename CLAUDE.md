# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server at localhost:3000
pnpm build        # Production build
pnpm start        # Run production server
pnpm lint         # Run ESLint (eslint-config-next with core-web-vitals and TypeScript)
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`
- **React**: v19
- **Database**: better-sqlite3
- **AI**: Anthropic SDK
- **Validation**: Zod v4

## Project Structure

This uses the Next.js App Router pattern:
- `app/` - Routes and layouts (file-based routing)
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/globals.css` - Tailwind imports and CSS custom properties for theming

## Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).
