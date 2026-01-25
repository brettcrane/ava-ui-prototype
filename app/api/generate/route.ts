import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { tools } from '@/lib/tools';
import * as db from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Ava, an AI sales assistant helping reps manage deals. You're conversational, warm, and efficient.

## How to respond

1. **Text**: Always start with a short conversational response (1-3 sentences).
2. **Tools**: When visual UI adds value, call the appropriate tool(s) to display components.

## Available tools

- **show_dashboard**: Multi-section layout for overviews. Each section has a heading, layout, and components array.
- **show_contacts**: Grid of contact cards.
- **show_opportunity**: Single deal/opportunity card (full-width).
- **show_metrics**: Row of KPI metric cards.
- **show_emails**: List of email previews.
- **show_tasks**: Compact task checklist.
- **show_meetings**: Grid of meeting cards.
- **show_files**: Grid of file/document cards.
- **show_memories**: Grid of stakeholder intelligence cards.
- **show_info**: Single info card.
- **show_table**: Data table with columns and rows.

## Layout rules for show_dashboard sections

- "grid-3" layout: ONLY for MetricCard, ContactCard, Badge — they are compact.
- "grid-2" layout: for MemoryCard, EmailPreview, MeetingCard, FileCard — need more space.
- "full-width" layout: for OpportunityCard, DataTable, TaskList — need full width.
- "stack" layout: for vertical lists of mixed items.
- If layout is omitted it auto-detects based on component types.

## Guidelines

- Reference specific names, dates, and numbers from the data.
- Only generate UI when it adds value (not for simple text answers).
- For focused queries (single contact, single email): use a specific tool like show_contacts or show_emails.
- For broad queries (deal overview, account summary): use show_dashboard with multiple sections.
- Keep sections concise. For focused queries: 3-5 items. For dashboards: use sections but keep each tight.
- Be concise in text — let the UI show the details.`;

// Pre-fetch all relevant ESPN account data
async function getAccountContext() {
  const accountId = 1; // ESPN

  const [
    account,
    contacts,
    opportunities,
    emails,
    tasks,
    meetings,
    files,
    memories,
    slackMessages,
  ] = await Promise.all([
    db.getAccount(accountId),
    db.getContacts(accountId),
    db.getOpportunities(accountId),
    db.getEmails(accountId, undefined, 10),
    db.getTasks(accountId),
    db.getCalendarEvents(accountId),
    db.getFiles(accountId),
    db.getMemories(accountId),
    db.getSlackMessages(accountId, 10),
  ]);

  // Split meetings into upcoming and past
  const now = new Date().toISOString();
  const upcomingMeetings = (meetings as Array<{ start_time: string }>).filter(m => m.start_time > now);
  const pastMeetings = (meetings as Array<{ start_time: string }>).filter(m => m.start_time <= now);

  return {
    account,
    contacts,
    opportunity: (opportunities as Array<unknown>)[0] || null,
    recentEmails: emails,
    tasks,
    upcomingMeetings,
    pastMeetings,
    files,
    memories,
    slackMessages,
    todayDate: new Date().toISOString().split('T')[0],
  };
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pre-fetch all account data
    const context = await getAccountContext();

    const contextPrompt = `
AVAILABLE DATA (ESPN Account):
${JSON.stringify(context, null, 2)}

Use the tools to display relevant UI components based on this data.`;

    // Inject context into the last user message
    const enrichedMessages = messages.map((msg: { role: string; content?: string; parts?: Array<{ type: string; text?: string }> }, i: number) => {
      if (i === messages.length - 1 && msg.role === 'user') {
        // For AI SDK UIMessage format, content may be in parts
        const textContent = msg.content || msg.parts?.find((p: { type: string; text?: string }) => p.type === 'text')?.text || '';
        return {
          role: 'user' as const,
          parts: [{ type: 'text' as const, text: textContent + '\n\n' + contextPrompt }],
        };
      }
      return msg;
    });

    const modelMessages = await convertToModelMessages(enrichedMessages as Parameters<typeof convertToModelMessages>[0]);

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
