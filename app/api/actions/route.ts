import {
  createTask,
  updateTaskStatus,
  deleteTask,
  createContact,
  deleteContact,
  createMemory,
  updateOpportunityStage,
  updateOpportunityCloseDate,
} from '@/lib/db';

export const runtime = 'nodejs';

interface ActionRequest {
  action: string;
  params: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const { action, params } = await request.json() as ActionRequest;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let result: unknown;

    switch (action) {
      // Task management
      case 'create_task':
        result = createTask({
          accountId: params.accountId as number | undefined,
          title: params.title as string,
          description: params.description as string | undefined,
          dueDate: params.dueDate as string | undefined,
        });
        break;

      case 'complete_task':
        result = updateTaskStatus(params.taskId as number, 'done');
        break;

      case 'update_task_status':
        result = updateTaskStatus(
          params.taskId as number,
          params.status as 'todo' | 'in_progress' | 'done'
        );
        break;

      case 'delete_task':
        result = deleteTask(params.taskId as number);
        break;

      // Contact management
      case 'create_contact':
        result = createContact({
          accountId: params.accountId as number | undefined,
          name: params.name as string,
          email: params.email as string | undefined,
          phone: params.phone as string | undefined,
          title: params.title as string | undefined,
        });
        break;

      case 'delete_contact':
        result = deleteContact(params.contactId as number);
        break;

      // Deal management
      case 'update_opportunity_stage':
        result = updateOpportunityStage(
          params.opportunityId as number,
          params.stage as string
        );
        break;

      case 'update_close_date':
        result = updateOpportunityCloseDate(
          params.opportunityId as number,
          params.closeDate as string
        );
        break;

      // Memory/knowledge
      case 'save_memory':
        result = createMemory({
          accountId: params.accountId as number,
          contactId: params.contactId as number | undefined,
          category: params.category as string,
          content: params.content as string,
        });
        break;

      // Communication (placeholder - would integrate with email/calendar APIs)
      case 'draft_email':
        // In a real app, this would open an email composer or save a draft
        result = {
          success: true,
          message: 'Email draft created',
          draft: {
            contactId: params.contactId,
            subject: params.subject,
            body: params.body,
          },
        };
        break;

      case 'schedule_meeting':
        // In a real app, this would create a calendar event
        result = {
          success: true,
          message: 'Meeting proposed',
          meeting: {
            accountId: params.accountId,
            title: params.title,
            attendeeIds: params.attendeeIds,
            proposedTime: params.proposedTime,
          },
        };
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
