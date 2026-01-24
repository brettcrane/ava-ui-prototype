import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';

// Initialize Anthropic client
export const anthropic = new Anthropic();

// Tool definitions for Claude
export const tools: Tool[] = [
  // Core entity queries
  {
    name: 'query_accounts',
    description: 'Get all accounts (companies) in the CRM',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'query_account',
    description: 'Get detailed information about a specific account (company)',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'The account ID',
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'query_contacts',
    description: 'Get contacts, optionally filtered by account. Returns name, title, email, phone, and whether they are the primary contact.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
      },
    },
  },
  {
    name: 'query_opportunity',
    description: 'Get deal/opportunity details for an account. Returns name, amount, stage, close date, and probability.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'The account ID',
        },
      },
      required: ['accountId'],
    },
  },

  // Communication history
  {
    name: 'query_emails',
    description: 'Get email history with an account or contact. Returns subject, body, direction (inbound/outbound), and date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        contactId: {
          type: 'number',
          description: 'Filter by contact ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of emails to return (default 20)',
        },
      },
    },
  },
  {
    name: 'query_conversations',
    description: 'Get call transcripts and meeting notes. Returns title, transcript (VTT format), duration, and date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        contactId: {
          type: 'number',
          description: 'Filter by contact ID',
        },
      },
    },
  },
  {
    name: 'query_slack_messages',
    description: 'Get internal Slack discussions about a deal. Returns channel, author, content, and timestamp.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of messages to return (default 20)',
        },
      },
    },
  },

  // Calendar & files
  {
    name: 'query_calendar',
    description: 'Get meetings (past or upcoming). Returns title, description, attendees, times, and meeting type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        upcoming: {
          type: 'boolean',
          description: 'If true, only return future meetings. If false, return all meetings.',
        },
      },
    },
  },
  {
    name: 'query_files',
    description: 'Get documents (RFPs, requirements, proposals). Returns name, type, description, and content summary.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
      },
    },
  },

  // Agent knowledge
  {
    name: 'query_memories',
    description: 'Get agent memories and observations about accounts or contacts. Categories include: preference, relationship, technical_need, objection, decision_process.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        contactId: {
          type: 'number',
          description: 'Filter by contact ID',
        },
        category: {
          type: 'string',
          enum: ['preference', 'relationship', 'technical_need', 'objection', 'decision_process'],
          description: 'Filter by category',
        },
      },
    },
  },
  {
    name: 'query_tasks',
    description: 'Get tasks/action items. Returns title, description, status, and due date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        accountId: {
          type: 'number',
          description: 'Filter by account ID',
        },
        status: {
          type: 'string',
          enum: ['todo', 'in_progress', 'done'],
          description: 'Filter by status',
        },
      },
    },
  },

  // UI generation
  {
    name: 'generate_ui',
    description: `Generate a UI component tree to display information visually. Call this AFTER your text response when visual display would add value.

UI tree format (flat structure with key references):
{
  "root": "element-key",
  "elements": {
    "element-key": {
      "key": "element-key",
      "type": "ComponentName",
      "props": { ... },
      "children": ["child-key-1", "child-key-2"]  // optional
    }
  }
}

Available components:
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
- ActionButton: { label: string, action: Action, variant?: 'primary'|'secondary'|'danger'|'outline' }
- Stack: { direction?: 'vertical'|'horizontal', gap?: 'none'|'sm'|'md'|'lg' } (has children)
- Grid: { columns?: number, gap?: 'none'|'sm'|'md'|'lg' } (has children)
- Text: { content: string, variant?: 'body'|'caption'|'heading'|'subheading' }
- Badge: { label: string, variant?: 'default'|'success'|'warning'|'error'|'info' }

Action format for buttons:
{
  "name": "action_name",
  "params": { ... },
  "confirm": {  // optional, for destructive actions
    "title": "Confirm?",
    "message": "This cannot be undone.",
    "variant": "danger"
  }
}

Available actions: create_task, complete_task, update_task_status, delete_task, create_contact, delete_contact, update_opportunity_stage, update_close_date, save_memory, draft_email, schedule_meeting`,
    input_schema: {
      type: 'object' as const,
      properties: {
        tree: {
          type: 'object',
          description: 'The UI tree with root key and elements map',
          properties: {
            root: { type: 'string' },
            elements: { type: 'object' },
          },
          required: ['root', 'elements'],
        },
      },
      required: ['tree'],
    },
  },
];

// System prompt for Ava
export const systemPrompt = `You are Ava, an AI sales assistant. You help sales reps manage deals, prepare for meetings, understand customer relationships, and stay on top of their pipeline.

IMPORTANT: Your text responses will be read on screen, so keep them conversational, warm, and concise. You're a helpful colleague, not a robot. Don't use overly formal language.

You have access to rich CRM data including:
- Account info (company details, industry, size)
- Contacts (people at accounts with roles/titles)
- Opportunities (deal details: amount, stage, close date)
- Email history with customers
- Call transcripts (past conversations)
- Slack discussions (internal team chatter about deals)
- Calendar (past and upcoming meetings)
- Files (RFPs, proposals, requirements docs)
- Memories (your observations about preferences, relationships, concerns)
- Tasks (action items)

## Workflow

1. **Query relevant data FIRST** to ground your response in facts. Don't make assumptions - always check the data.
2. **Respond naturally** with helpful, actionable insights. Be specific and reference actual data.
3. **Generate UI when visual display adds value** - use tables for lists, cards for details, buttons for actions.

## Response Guidelines

- Be conversational but efficient. Get to the point.
- Reference specific names, dates, and details from the data.
- Proactively surface relevant information the user might not have asked for but would find helpful.
- When displaying data, prefer visual UI components over plain text lists.
- For actions (create task, update deal stage, etc.), generate ActionButton components so the user can confirm with a click.

## Important Context

- The default account is ESPN (id: 1) - a major streaming platform deal in negotiation stage.
- Today's date should be used for calculating "upcoming" vs "past" meetings.
- When someone asks about "the deal" or "this account" without specifying, assume ESPN.

## UI Generation Tips

- Use Stack with direction="vertical" to arrange multiple items
- Use Grid with columns=2 for side-by-side layouts
- Keep UI concise - show the most relevant 3-5 items, not everything
- Use MetricCard for key numbers (deal amount, probability)
- Use ActionButton for any action the user might want to take`;

// Types for streaming
export interface StreamChunk {
  type: 'text' | 'ui' | 'tool_use' | 'tool_result' | 'done' | 'error';
  content?: string;
  tree?: unknown;
  toolName?: string;
  toolInput?: unknown;
  toolId?: string;
  error?: string;
}

// Execute tool calls and return results
export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  // Dynamic import to avoid issues with server-side module resolution
  const db = await import('./db');

  switch (toolName) {
    case 'query_accounts':
      return db.getAccounts();
    case 'query_account':
      return db.getAccount(toolInput.accountId as number);
    case 'query_contacts':
      return db.getContacts(toolInput.accountId as number | undefined);
    case 'query_opportunity':
      return db.getOpportunities(toolInput.accountId as number);
    case 'query_emails':
      return db.getEmails(
        toolInput.accountId as number | undefined,
        toolInput.contactId as number | undefined,
        toolInput.limit as number | undefined
      );
    case 'query_conversations':
      return db.getConversations(
        toolInput.accountId as number | undefined,
        toolInput.contactId as number | undefined
      );
    case 'query_slack_messages':
      return db.getSlackMessages(
        toolInput.accountId as number | undefined,
        toolInput.limit as number | undefined
      );
    case 'query_calendar':
      return db.getCalendarEvents(
        toolInput.accountId as number | undefined,
        toolInput.upcoming as boolean | undefined
      );
    case 'query_files':
      return db.getFiles(toolInput.accountId as number | undefined);
    case 'query_memories':
      return db.getMemories(
        toolInput.accountId as number | undefined,
        toolInput.contactId as number | undefined,
        toolInput.category as string | undefined
      );
    case 'query_tasks':
      return db.getTasks(
        toolInput.accountId as number | undefined,
        toolInput.status as string | undefined
      );
    case 'generate_ui':
      // This is handled specially - return the tree directly
      return toolInput.tree;
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Helper to check if a block is a ToolUseBlock
function isToolUseBlock(block: Anthropic.Messages.ContentBlock): block is ToolUseBlock {
  return block.type === 'tool_use';
}


// Run the agentic loop with Claude
export async function* runAgenticLoop(
  messages: MessageParam[]
): AsyncGenerator<StreamChunk> {
  let currentMessages = [...messages];
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops

  while (iterations < maxIterations) {
    iterations++;

    // Create message with streaming
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: currentMessages,
    });

    // Collect tool calls while streaming text to client
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield { type: 'text', content: event.delta.text };
        }
        // Tool input deltas are handled when we get the final message
      }
    }

    // Get the final message
    const finalMessage = await stream.finalMessage();

    // Extract tool uses from the response
    for (const block of finalMessage.content) {
      if (isToolUseBlock(block)) {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    // If no tool calls, we're done
    if (toolCalls.length === 0) {
      yield { type: 'done' };
      return;
    }

    // Process tool calls
    const toolResults: MessageParam['content'] = [];

    for (const tool of toolCalls) {
      yield { type: 'tool_use', toolName: tool.name, toolInput: tool.input, toolId: tool.id };

      try {
        const result = await executeToolCall(tool.name, tool.input);

        // If it's generate_ui, yield the UI tree
        if (tool.name === 'generate_ui') {
          yield { type: 'ui', tree: result };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(result),
        });

        yield { type: 'tool_result', toolId: tool.id };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify({ error: errorMessage }),
          is_error: true,
        });
        yield { type: 'error', error: errorMessage };
      }
    }

    // If the only tool call was generate_ui, we're done
    if (toolCalls.length === 1 && toolCalls[0].name === 'generate_ui') {
      yield { type: 'done' };
      return;
    }

    // Add assistant message and tool results to continue the loop
    currentMessages = [
      ...currentMessages,
      {
        role: 'assistant' as const,
        content: finalMessage.content,
      },
      {
        role: 'user' as const,
        content: toolResults as MessageParam['content'],
      },
    ];
  }

  yield { type: 'error', error: 'Max iterations reached' };
}
