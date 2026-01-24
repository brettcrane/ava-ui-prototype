import Anthropic from '@anthropic-ai/sdk';
import * as db from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

// System prompt for streaming JSONL UI generation
const SYSTEM_PROMPT = `You are Ava, an AI sales assistant helping reps manage deals. You're conversational, warm, and efficient.

## Response Format

Your response has TWO parts, separated by "---UI---":

1. **TEXT**: Conversational response to the user (1-3 sentences, friendly and helpful)
2. **UI**: JSONL patches that build a visual UI (one JSON object per line)

---UI---

JSONL PATCH FORMAT:
{"op":"set","path":"/root","value":"element-key"}
{"op":"add","path":"/elements/element-key","value":{"key":"element-key","type":"ComponentName","props":{...}}}

AVAILABLE COMPONENTS:
- InfoCard: { title: string, content: string, variant?: 'default'|'success'|'warning'|'error' }
- DataTable: { columns: [{key, label}], rows: [{}], emptyMessage?: string }
- MetricCard: { label: string, value: string|number, format?: 'currency'|'number'|'percent', trend?: 'up'|'down'|'neutral' }
- ContactCard: { name: string, title?: string, email?: string, phone?: string, isPrimary?: boolean }
- OpportunityCard: { name: string, amount: number, stage: string, closeDate: string, probability?: number }
- EmailPreview: { subject: string, from?: string, to?: string, body: string, date?: string, direction?: 'inbound'|'outbound' }
- TaskItem: { id: number, title: string, description?: string, status: 'todo'|'in_progress'|'done', dueDate?: string }
- MeetingCard: { title: string, date: string, time?: string, attendees?: string[], meetingType?: string }
- FileCard: { name: string, fileType: string, description?: string, summary?: string }
- MemoryCard: { category: string, content: string, contact?: string, confidence?: number }
- ActionButton: { label: string, action: {name: string, params?: {}}, variant?: 'primary'|'secondary'|'danger'|'outline' }
- Stack: { direction?: 'vertical'|'horizontal', gap?: 'none'|'sm'|'md'|'lg' } (container with children array)
- Grid: { columns?: number, gap?: 'none'|'sm'|'md'|'lg' } (container with children array)
- Text: { content: string, variant?: 'body'|'caption'|'heading'|'subheading' }
- Badge: { label: string, variant?: 'default'|'success'|'warning'|'error'|'info' }

RULES:
1. First line MUST be: {"op":"set","path":"/root","value":"<root-key>"}
2. Add elements with: {"op":"add","path":"/elements/<key>","value":{...element...}}
3. Container elements use "children" array with child element keys
4. Stream progressively - parent elements first, then children
5. Keep UIs concise. For focused queries: 3-5 items. For dashboard/overview queries: use sections but keep each section tight.
6. Use unique keys for each element (e.g., "main-stack", "contact-1", "metric-amount")

LAYOUT RULES (IMPORTANT):
- The UI renders inside a chat message column (~650-800px wide). Do NOT use Grid with columns=3 or columns=4 for content cards — they will be cramped. Use columns=2 max for cards.
- Grid columns=3 is ONLY ok for small items like MetricCards or Badges.
- For dashboards with many sections, use a single root Stack(vertical) and group related items into labeled sections using Text(heading) + Grid(columns=2) or Stack.
- NEVER nest a Grid inside another Grid. Keep layouts flat: root Stack > section heading > Grid of cards.
- OpportunityCard, MeetingCard, ContactCard, and EmailPreview should NEVER be in a 3-column grid — they need at least 280px width each.

EXAMPLE for showing a contact:
---UI---
{"op":"set","path":"/root","value":"main-stack"}
{"op":"add","path":"/elements/main-stack","value":{"key":"main-stack","type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["contact-sarah"]}}
{"op":"add","path":"/elements/contact-sarah","value":{"key":"contact-sarah","type":"ContactCard","props":{"name":"Sarah Chen","title":"VP Engineering","email":"sarah@example.com","isPrimary":true}}}

EXAMPLE for a dashboard with multiple sections:
---UI---
{"op":"set","path":"/root","value":"dashboard"}
{"op":"add","path":"/elements/dashboard","value":{"key":"dashboard","type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["opp-1","metrics-heading","metrics-grid","contacts-heading","contacts-grid","meetings-heading","meetings-stack"]}}
{"op":"add","path":"/elements/opp-1","value":{"key":"opp-1","type":"OpportunityCard","props":{"name":"Deal Name","amount":100000,"stage":"negotiation","closeDate":"2025-03-01","probability":75}}}
{"op":"add","path":"/elements/metrics-heading","value":{"key":"metrics-heading","type":"Text","props":{"content":"Key Metrics","variant":"heading"}}}
{"op":"add","path":"/elements/metrics-grid","value":{"key":"metrics-grid","type":"Grid","props":{"columns":3,"gap":"md"},"children":["m1","m2","m3"]}}
{"op":"add","path":"/elements/contacts-heading","value":{"key":"contacts-heading","type":"Text","props":{"content":"Key Contacts","variant":"heading"}}}
{"op":"add","path":"/elements/contacts-grid","value":{"key":"contacts-grid","type":"Grid","props":{"columns":2,"gap":"md"},"children":["c1","c2"]}}

## Guidelines

- Reference specific names, dates, and numbers from the data
- Use tables for lists, cards for details, metrics for key numbers
- Only generate UI when it adds value (not for simple text answers)
- Be concise in text - let the UI show the details`;

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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pre-fetch all account data
    const context = await getAccountContext();

    // Build the prompt with context
    const contextPrompt = `
AVAILABLE DATA (ESPN Account):
${JSON.stringify(context, null, 2)}

Remember: Respond with TEXT first, then ---UI--- delimiter, then JSONL patches.`;

    // Add context to the last user message
    const enhancedMessages = messages.map((msg, i) => {
      if (i === messages.length - 1 && msg.role === 'user') {
        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content + '\n\n' + contextPrompt,
        };
      }
      return { role: msg.role as 'user' | 'assistant', content: msg.content };
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start Claude stream
    (async () => {
      try {
        const response = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: enhancedMessages,
        });

        let inUISection = false;
        let fullText = '';
        let lastSentLength = 0;

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            fullText += text;

            // Check for UI delimiter
            if (!inUISection && fullText.includes('---UI---')) {
              const [textPart, uiPart] = fullText.split('---UI---');

              // Send any unsent text portion
              const unsentText = textPart.slice(lastSentLength);
              if (unsentText.trim()) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: unsentText })}\n\n`));
              }

              // Signal UI section starting
              await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'ui_start' })}\n\n`));

              inUISection = true;
              fullText = uiPart || '';
              lastSentLength = 0;

              // Process any complete lines already in the UI section
              const lines = fullText.split('\n');
              const incompleteLine = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && trimmed.startsWith('{')) {
                  try {
                    const patch = JSON.parse(trimmed);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'patch', patch })}\n\n`));
                  } catch {
                    // Skip invalid JSON
                  }
                }
              }

              fullText = incompleteLine;
            } else if (inUISection) {
              // In UI section - process complete JSONL lines
              const lines = fullText.split('\n');
              const incompleteLine = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && trimmed.startsWith('{')) {
                  try {
                    const patch = JSON.parse(trimmed);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'patch', patch })}\n\n`));
                  } catch {
                    // Skip invalid JSON
                  }
                }
              }

              fullText = incompleteLine;
            } else {
              // Still in text section - stream text, but stop before potential delimiter
              // Only stream up to the last complete word/character before any potential "---"
              const potentialDelimiterIdx = fullText.lastIndexOf('-');
              const safeEndIdx = potentialDelimiterIdx > lastSentLength
                ? Math.max(lastSentLength, potentialDelimiterIdx - 3)  // Buffer back a bit
                : fullText.length;

              const textToSend = fullText.slice(lastSentLength, safeEndIdx);
              if (textToSend) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: textToSend })}\n\n`));
                lastSentLength = safeEndIdx;
              }
            }
          }
        }

        // Send any remaining text that wasn't sent yet (before the delimiter check)
        if (!inUISection && lastSentLength < fullText.length) {
          const remainingText = fullText.slice(lastSentLength);
          if (remainingText.trim()) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: remainingText })}\n\n`));
          }
        }

        // Process any remaining buffer in UI section
        if (inUISection && fullText.trim()) {
          const trimmed = fullText.trim();
          if (trimmed.startsWith('{')) {
            try {
              const patch = JSON.parse(trimmed);
              await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'patch', patch })}\n\n`));
            } catch {
              // Skip invalid JSON
            }
          }
        }

        // Signal completion
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
