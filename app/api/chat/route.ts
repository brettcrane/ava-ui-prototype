import { runAgenticLoop } from '@/lib/claude';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as { messages: MessageParam[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the agentic loop in the background
    (async () => {
      try {
        for await (const chunk of runAgenticLoop(messages)) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          await writer.write(encoder.encode(data));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorData = `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`;
        await writer.write(encoder.encode(errorData));
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
