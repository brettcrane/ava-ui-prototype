import { tool } from 'ai';
import { z } from 'zod';

// ── Shared sub-schemas ──────────────────────────────────────────────

const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done'] as const),
  dueDate: z.string().optional(),
});

const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
});

// ── Component schema for dashboard sections ─────────────────────────

const componentSchema = z.object({
  type: z.enum(['InfoCard', 'MetricCard', 'ContactCard', 'OpportunityCard', 'EmailPreview', 'TaskList', 'MeetingCard', 'FileCard', 'MemoryCard', 'DataTable', 'Badge', 'ActionButton', 'Text']),
  // All possible props flattened — Claude picks the right ones per type
  title: z.string().optional(),
  content: z.string().optional(),
  variant: z.string().optional(),
  label: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  format: z.string().optional(),
  trend: z.string().optional(),
  change: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().optional(),
  amount: z.number().optional(),
  stage: z.string().optional(),
  closeDate: z.string().optional(),
  probability: z.number().optional(),
  subject: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  body: z.string().optional(),
  date: z.string().optional(),
  direction: z.string().optional(),
  tasks: z.array(taskSchema).optional(),
  columns: z.array(columnSchema).optional(),
  rows: z.array(z.record(z.string(), z.unknown())).optional(),
  emptyMessage: z.string().optional(),
  time: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  meetingType: z.string().optional(),
  fileType: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  category: z.string().optional(),
  contact: z.string().optional(),
  confidence: z.string().optional(),
  actionName: z.string().optional(),
  actionParams: z.record(z.string(), z.unknown()).optional(),
});

const sectionSchema = z.object({
  heading: z.string().optional(),
  layout: z.string().optional(),
  components: z.array(componentSchema),
});

// ── Tool definitions ────────────────────────────────────────────────
// Zod v4 type inference is incompatible with AI SDK's tool() generic,
// so we cast parameters to `any` to bypass the broken inference.
// The schemas still provide runtime validation — only compile-time
// inference of the execute parameter type is affected.

/* eslint-disable @typescript-eslint/no-explicit-any */
export const tools = {
  show_dashboard: tool({
    description: `Display a multi-section dashboard with various components. Use this for overview/summary requests that show multiple types of information. Each section has an optional heading and a layout. Component types: InfoCard, MetricCard, ContactCard, OpportunityCard, EmailPreview, TaskList, MeetingCard, FileCard, MemoryCard, DataTable, Badge, ActionButton. Layout rules:
- "grid-3": ONLY for MetricCard, ContactCard, Badge (compact items)
- "grid-2": for EmailPreview, MeetingCard, FileCard, MemoryCard (need more space)
- "full-width": for OpportunityCard, DataTable, TaskList (need full width)
- "stack": for vertical lists of mixed items
If layout is omitted, it defaults based on component types automatically.`,
    parameters: z.object({ sections: z.array(sectionSchema) }),
    execute: async (input: any) => ({ sections: input.sections }),
  } as any),

  show_contacts: tool({
    description: 'Display one or more contact cards in a grid layout.',
    parameters: z.object({
      contacts: z.array(z.object({
        name: z.string(),
        title: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })),
    }),
    execute: async (input: any) => ({ contacts: input.contacts }),
  } as any),

  show_opportunity: tool({
    description: 'Display a single opportunity/deal card with pipeline stage, amount, and probability.',
    parameters: z.object({
      name: z.string(),
      amount: z.number(),
      stage: z.string(),
      closeDate: z.string(),
      probability: z.number().optional(),
    }),
    execute: async (input: any) => input,
  } as any),

  show_metrics: tool({
    description: 'Display a row of metric/KPI cards showing key numbers.',
    parameters: z.object({
      metrics: z.array(z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        format: z.string().optional(),
        trend: z.string().optional(),
        change: z.string().optional(),
      })),
    }),
    execute: async (input: any) => ({ metrics: input.metrics }),
  } as any),

  show_emails: tool({
    description: 'Display a list of email previews.',
    parameters: z.object({
      emails: z.array(z.object({
        subject: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        body: z.string(),
        date: z.string().optional(),
        direction: z.string().optional(),
      })),
    }),
    execute: async (input: any) => ({ emails: input.emails }),
  } as any),

  show_tasks: tool({
    description: 'Display a compact task checklist.',
    parameters: z.object({ tasks: z.array(taskSchema) }),
    execute: async (input: any) => ({ tasks: input.tasks }),
  } as any),

  show_meetings: tool({
    description: 'Display meeting cards in a grid.',
    parameters: z.object({
      meetings: z.array(z.object({
        title: z.string(),
        date: z.string(),
        time: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        meetingType: z.string().optional(),
      })),
    }),
    execute: async (input: any) => ({ meetings: input.meetings }),
  } as any),

  show_files: tool({
    description: 'Display file cards for documents.',
    parameters: z.object({
      files: z.array(z.object({
        name: z.string(),
        fileType: z.string(),
        description: z.string().optional(),
        summary: z.string().optional(),
      })),
    }),
    execute: async (input: any) => ({ files: input.files }),
  } as any),

  show_memories: tool({
    description: 'Display stakeholder intelligence/memory cards with insights about contacts.',
    parameters: z.object({
      memories: z.array(z.object({
        category: z.string(),
        content: z.string(),
        contact: z.string().optional(),
        confidence: z.string().optional(),
      })),
    }),
    execute: async (input: any) => ({ memories: input.memories }),
  } as any),

  show_info: tool({
    description: 'Display a single info card with a title and content text.',
    parameters: z.object({
      title: z.string(),
      content: z.string(),
      variant: z.string().optional(),
    }),
    execute: async (input: any) => input,
  } as any),

  show_table: tool({
    description: 'Display a data table with columns and rows.',
    parameters: z.object({
      columns: z.array(columnSchema),
      rows: z.array(z.record(z.string(), z.unknown())),
      emptyMessage: z.string().optional(),
    }),
    execute: async (input: any) => input,
  } as any),
};
/* eslint-enable @typescript-eslint/no-explicit-any */
