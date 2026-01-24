import { getChats, createChat, type ChatMessage } from '@/lib/db';

export const runtime = 'nodejs';

// GET all chats
export async function GET() {
  try {
    const chats = getChats();
    return new Response(JSON.stringify(chats), {
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

// POST create new chat
export async function POST(request: Request) {
  try {
    const { title, messages } = await request.json() as { title: string; messages: ChatMessage[] };

    if (!title || !messages) {
      return new Response(JSON.stringify({ error: 'Title and messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const chat = createChat(title, messages);
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
