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
- **Database**: better-sqlite3 (SQLite, auto-created at `ava.db`)
- **AI**: Anthropic SDK (`claude-sonnet-4-20250514`)
- **UI Rendering**: `@json-render/core` + `@json-render/react` for streaming component trees
- **UI Primitives**: Headless UI, Heroicons
- **Validation**: Zod v4

## Project Structure

```
app/
  layout.tsx              # Root layout with Geist font
  page.tsx                # Main page — left sidebar + chat + right sidebar
  globals.css             # Tailwind imports + CSS custom properties
  api/
    generate/route.ts     # Main streaming endpoint (text + JSONL UI patches via SSE)
    actions/route.ts      # Mutation handler (task/contact/deal CRUD)
    chats/route.ts        # Chat persistence (list + create)
    chats/[id]/route.ts   # Chat CRUD (get/update/delete)
    sidebar/route.ts      # Right sidebar data aggregation
    tasks/route.ts        # Task creation
    tasks/[id]/route.ts   # Task status updates

components/
  ava-components.tsx      # 16 registered UI components (Grid, Stack, ContactCard, etc.)
  chat-interface.tsx      # Chat container, SSE stream handler, message state
  chat-message.tsx        # Message renderer (Markdown text + json-render UI tree)
  voice-input.tsx         # Voice transcription (Web Speech API) + text input
  left-sidebar.tsx        # Navigation + recent spaces
  sidebar.tsx             # Right context sidebar (meetings, deal, tasks)
  popular-prompts-popover.tsx  # Suggested prompt popover

lib/
  db.ts                   # SQLite schema, seed data, query helpers
  claude.ts               # Claude AI tools/system prompt (agentic loop, not yet wired to /api/generate)
```

## Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).

## Architecture: Streaming UI System

The core pattern is Claude responding with text + structured UI via JSONL patches over SSE:

1. **Frontend** sends chat messages to `POST /api/generate`
2. **Backend** fetches all ESPN account data, builds context, streams Claude's response
3. **Response format**: text section, then `---UI---` delimiter, then JSONL patch lines
4. **Patch format**: `{"op":"set","path":"/root","value":"key"}` and `{"op":"add","path":"/elements/key","value":{...}}`
5. **Frontend** applies patches progressively to build a `UITree`, rendered by `@json-render/react`

## Layout Constraints

The UI renders inside a chat message column (~650-800px wide, constrained by two sidebars). Key rules:
- Grid uses CSS `auto-fit` + `minmax()` instead of viewport breakpoints (breakpoints don't work inside the narrow chat column)
- Max 2-column grids for content cards; 3-column only for small items like MetricCards
- OpportunityCard internal stats use flex-wrap, not fixed grid-cols

## Database

SQLite with ESPN seed data: 1 account, 5 contacts, 1 opportunity ($450K negotiation), 6 emails, 3 call transcripts, 7 Slack messages, 5 calendar events, 4 files, 10 memories, 10 tasks. Schema auto-creates on first access.

## Environment Variables

```
ANTHROPIC_API_KEY=   # Required — Claude API key
```
