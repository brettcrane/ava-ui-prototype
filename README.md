# Ava — AI Sales Agent Prototype

A voice-first AI sales assistant built with Next.js, Claude, and a streaming UI component system. Ava helps sales reps manage deals by rendering rich, interactive dashboards from natural language queries.

## Quick Start

```bash
pnpm install
cp .env.local.example .env.local  # Add your ANTHROPIC_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database auto-creates and seeds with ESPN demo data on first run.

## How It Works

1. **Ask Ava anything** about the ESPN deal — via text or voice input (Web Speech API)
2. **Claude streams back** a text response followed by structured UI components
3. **Components render progressively** as JSONL patches arrive over SSE
4. **Interact** with rendered cards, tables, and action buttons that mutate the database

### Streaming UI Architecture

Responses are split into two sections separated by a `---UI---` delimiter:

- **Text**: Conversational markdown streamed token-by-token
- **UI**: JSONL patches that progressively build a component tree, rendered by `@json-render/react`

This allows text to appear immediately while richer UI components load in behind it.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **Anthropic SDK** — Claude Sonnet for AI responses
- **@json-render/react** — declarative UI tree rendering from JSON
- **better-sqlite3** — local SQLite database with ESPN seed data
- **Headless UI** + **Heroicons** — accessible UI primitives
- **Web Speech API** — browser-native voice transcription

## Project Structure

```
app/
  page.tsx                    # Main layout (left sidebar + chat + right sidebar)
  api/generate/               # Streaming AI endpoint (SSE with text + JSONL patches)
  api/actions/                # Mutation handler (tasks, contacts, deals)
  api/chats/                  # Chat persistence
  api/sidebar/                # Right sidebar data

components/
  ava-components.tsx          # 16 UI components (cards, grids, tables, etc.)
  chat-interface.tsx           # Chat container + SSE stream handler
  chat-message.tsx            # Message renderer (Markdown + UI tree)
  voice-input.tsx             # Voice + text input

lib/
  db.ts                       # SQLite schema, seed data, queries
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |

## Demo Data

The database seeds with an ESPN Streaming Platform Deal:
- **Account**: ESPN (Media & Entertainment)
- **Opportunity**: $450K, negotiation stage, 75% probability
- **Contacts**: 5 stakeholders (VP Engineering, CTO, Director of Streaming, etc.)
- **History**: 6 emails, 3 call transcripts, 7 Slack messages
- **Files**: RFP, pricing sheet, technical architecture, M&A draft
- **Tasks**: 10 action items (5 open, 5 completed)
- **Memories**: 10 AI observations about stakeholder preferences and concerns
