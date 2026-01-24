import { getChat, updateChat, deleteChat, type ChatMessage } from '@/lib/db';

export const runtime = 'nodejs';

// GET single chat
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chat = getChat(parseInt(id, 10));

    if (!chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(chat), {
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

// PUT update chat
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, messages } = await request.json() as { title: string; messages: ChatMessage[] };

    if (!title || !messages) {
      return new Response(JSON.stringify({ error: 'Title and messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const chat = updateChat(parseInt(id, 10), title, messages);

    if (!chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(chat), {
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

// DELETE chat
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteChat(parseInt(id, 10));

    return new Response(JSON.stringify({ success: true }), {
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
