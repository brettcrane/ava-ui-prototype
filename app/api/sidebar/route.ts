import { getCalendarEvents, getOpportunities, getTasks } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get ESPN account data (id: 1)
    const accountId = 1;

    const allMeetings = getCalendarEvents(accountId) as Array<{
      id: number;
      title: string;
      start_time: string;
      end_time: string;
      attendees_json: string;
      meeting_type: string;
    }>;

    const now = new Date().toISOString();
    const upcomingMeetings = allMeetings.filter(m => m.start_time > now);
    const pastMeetings = allMeetings.filter(m => m.start_time <= now);

    const opportunities = getOpportunities(accountId) as Array<{
      id: number;
      name: string;
      amount: number;
      stage: string;
      close_date: string;
      probability: number;
    }>;

    const tasks = getTasks(accountId) as Array<{
      id: number;
      title: string;
      status: string;
      due_date: string;
    }>;

    return new Response(JSON.stringify({
      upcomingMeetings,
      pastMeetings,
      opportunity: opportunities[0] || null,
      tasks,
    }), {
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
