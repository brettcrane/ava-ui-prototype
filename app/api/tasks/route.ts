import { createTask } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, dueDate } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default to ESPN account (id: 1)
    const newTask = createTask({
      accountId: 1,
      title: title.trim(),
      description: description?.trim() || undefined,
      dueDate: dueDate || undefined,
    });

    return new Response(JSON.stringify(newTask), {
      status: 201,
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
