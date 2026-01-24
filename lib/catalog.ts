import { createCatalog, ActionSchema } from '@json-render/core';
import { z } from 'zod';

export const catalog = createCatalog({
  name: 'Ava CRM Components',
  components: {
    // Display components
    InfoCard: {
      props: z.object({
        title: z.string(),
        content: z.string(),
        variant: z.enum(['default', 'success', 'warning', 'error']).optional(),
      }),
      description: 'Display titled information with optional color variant',
    },

    DataTable: {
      props: z.object({
        columns: z.array(z.object({
          key: z.string(),
          label: z.string(),
        })),
        rows: z.array(z.record(z.string(), z.unknown())),
        emptyMessage: z.string().optional(),
      }),
      description: 'Display tabular data with columns and rows',
    },

    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        format: z.enum(['currency', 'number', 'percent']).optional(),
        trend: z.enum(['up', 'down', 'neutral']).optional(),
      }),
      description: 'Display a single metric value with optional formatting and trend indicator',
    },

    ContactCard: {
      props: z.object({
        name: z.string(),
        title: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
      description: 'Display a contact with their details',
    },

    OpportunityCard: {
      props: z.object({
        name: z.string(),
        amount: z.number(),
        stage: z.string(),
        closeDate: z.string(),
        probability: z.number().optional(),
      }),
      description: 'Display a deal/opportunity summary',
    },

    EmailPreview: {
      props: z.object({
        subject: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        body: z.string(),
        date: z.string().optional(),
        direction: z.enum(['inbound', 'outbound']).optional(),
      }),
      description: 'Display an email preview',
    },

    TaskItem: {
      props: z.object({
        id: z.number(),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'done']),
        dueDate: z.string().optional(),
      }),
      description: 'Display a task with status and optional due date',
    },

    MeetingCard: {
      props: z.object({
        title: z.string(),
        date: z.string(),
        time: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        meetingType: z.string().optional(),
      }),
      description: 'Display a calendar event/meeting',
    },

    FileCard: {
      props: z.object({
        name: z.string(),
        fileType: z.string(),
        description: z.string().optional(),
        summary: z.string().optional(),
      }),
      description: 'Display a file/document reference',
    },

    MemoryCard: {
      props: z.object({
        category: z.string(),
        content: z.string(),
        contact: z.string().optional(),
        confidence: z.number().optional(),
      }),
      description: 'Display an agent memory/observation',
    },

    // Interactive components
    ActionButton: {
      props: z.object({
        label: z.string(),
        action: ActionSchema,
        variant: z.enum(['primary', 'secondary', 'danger', 'outline']).optional(),
        disabled: z.boolean().optional(),
        size: z.enum(['sm', 'md', 'lg']).optional(),
      }),
      description: 'Button that triggers an action when clicked',
    },

    FormField: {
      props: z.object({
        label: z.string(),
        fieldType: z.enum(['text', 'email', 'tel', 'date', 'textarea', 'select', 'number']),
        path: z.string(),
        placeholder: z.string().optional(),
        options: z.array(z.object({
          value: z.string(),
          label: z.string(),
        })).optional(),
        required: z.boolean().optional(),
      }),
      description: 'Form input with data binding to a path',
    },

    // Layout components
    Form: {
      props: z.object({
        title: z.string().optional(),
        submitAction: ActionSchema.optional(),
        submitLabel: z.string().optional(),
      }),
      hasChildren: true,
      description: 'Form container with optional submit button',
    },

    Stack: {
      props: z.object({
        direction: z.enum(['vertical', 'horizontal']).optional(),
        gap: z.enum(['none', 'sm', 'md', 'lg']).optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
      }),
      hasChildren: true,
      description: 'Flexbox layout container for arranging children',
    },

    Grid: {
      props: z.object({
        columns: z.number().optional(),
        gap: z.enum(['none', 'sm', 'md', 'lg']).optional(),
      }),
      hasChildren: true,
      description: 'Grid layout container',
    },

    Text: {
      props: z.object({
        content: z.string(),
        variant: z.enum(['body', 'caption', 'heading', 'subheading', 'label']).optional(),
        color: z.enum(['default', 'muted', 'success', 'warning', 'error']).optional(),
      }),
      description: 'Text content with typography styling',
    },

    Divider: {
      props: z.object({
        label: z.string().optional(),
      }),
      description: 'Visual separator, optionally with a label',
    },

    Badge: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['default', 'success', 'warning', 'error', 'info']).optional(),
      }),
      description: 'Small status badge/tag',
    },
  },

  actions: {
    // Task management
    create_task: {
      params: z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        accountId: z.number().optional(),
      }),
      description: 'Create a new task/action item',
    },
    complete_task: {
      params: z.object({
        taskId: z.number(),
      }),
      description: 'Mark a task as complete',
    },
    update_task_status: {
      params: z.object({
        taskId: z.number(),
        status: z.enum(['todo', 'in_progress', 'done']),
      }),
      description: 'Update task status',
    },
    delete_task: {
      params: z.object({
        taskId: z.number(),
      }),
      description: 'Delete a task',
    },

    // Contact management
    create_contact: {
      params: z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        accountId: z.number().optional(),
      }),
      description: 'Create a new contact',
    },
    delete_contact: {
      params: z.object({
        contactId: z.number(),
      }),
      description: 'Delete a contact',
    },

    // Deal management
    update_opportunity_stage: {
      params: z.object({
        opportunityId: z.number(),
        stage: z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
      }),
      description: 'Update deal stage in the pipeline',
    },
    update_close_date: {
      params: z.object({
        opportunityId: z.number(),
        closeDate: z.string(),
      }),
      description: 'Update expected close date',
    },

    // Memory/knowledge
    save_memory: {
      params: z.object({
        accountId: z.number(),
        contactId: z.number().optional(),
        category: z.enum(['preference', 'relationship', 'technical_need', 'objection', 'decision_process']),
        content: z.string(),
      }),
      description: 'Save an observation or insight about an account/contact',
    },

    // Communication
    draft_email: {
      params: z.object({
        contactId: z.number(),
        subject: z.string(),
        body: z.string(),
      }),
      description: 'Draft an email to a contact',
    },
    schedule_meeting: {
      params: z.object({
        accountId: z.number(),
        title: z.string(),
        attendeeIds: z.array(z.number()),
        proposedTime: z.string(),
      }),
      description: 'Propose a meeting time',
    },
  },

  validation: 'strict',
});

// Export component names for reference
export const componentNames = catalog.componentNames;
export const actionNames = catalog.actionNames;

export type CatalogType = typeof catalog;
