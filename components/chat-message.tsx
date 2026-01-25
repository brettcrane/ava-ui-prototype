'use client';

import React from 'react';
import Markdown from 'react-markdown';
import type { UIMessage } from '@ai-sdk/react';
import {
  ContactCard,
  OpportunityCard,
  MetricCard,
  EmailPreview,
  TaskList,
  MeetingCard,
  FileCard,
  MemoryCard,
  InfoCard,
  DataTable,
  DashboardSection,
} from './ava-components';

interface ChatMessageProps {
  message: UIMessage;
}

// Elegant thinking indicator - shows before any content
function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-semibold">
        A
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-[pulse_1s_ease-in-out_infinite_200ms]" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-[pulse_1s_ease-in-out_infinite_400ms]" style={{ animationDelay: '400ms' }} />
        </div>
        <span className="text-sm text-gray-500">Ava is thinking...</span>
      </div>
    </div>
  );
}

// Component generation indicator
function GeneratingUIIndicator() {
  return (
    <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-xl">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-purple-200 rounded-full" />
        <div className="absolute inset-0 border-2 border-purple-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <span className="text-sm text-purple-700">Generating component...</span>
    </div>
  );
}

// Render tool result as a UI component
function ToolResultRenderer({ toolName, output }: { toolName: string; output: Record<string, unknown> }) {
  switch (toolName) {
    case 'show_dashboard': {
      const sections = output.sections as Array<{ heading?: string; layout?: string; components: Array<Record<string, unknown>> }>;
      return (
        <div className="flex flex-col gap-4">
          {sections.map((section, i) => (
            <DashboardSection key={i} section={section} />
          ))}
        </div>
      );
    }
    case 'show_contacts': {
      const contacts = output.contacts as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {contacts.map((c, i) => (
            <ContactCard key={i} name={c.name as string} title={c.title as string} email={c.email as string} phone={c.phone as string} isPrimary={c.isPrimary as boolean} />
          ))}
        </div>
      );
    }
    case 'show_opportunity':
      return <OpportunityCard name={output.name as string} amount={output.amount as number} stage={output.stage as string} closeDate={output.closeDate as string} probability={output.probability as number} />;
    case 'show_metrics': {
      const metrics = output.metrics as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {metrics.map((m, i) => (
            <MetricCard key={i} label={m.label as string} value={m.value as string | number} format={m.format as 'currency' | 'number' | 'percent'} trend={m.trend as 'up' | 'down' | 'neutral'} change={m.change as string} />
          ))}
        </div>
      );
    }
    case 'show_emails': {
      const emails = output.emails as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {emails.map((e, i) => (
            <EmailPreview key={i} subject={e.subject as string} from={e.from as string} to={e.to as string} body={e.body as string} date={e.date as string} direction={e.direction as 'inbound' | 'outbound'} />
          ))}
        </div>
      );
    }
    case 'show_tasks': {
      const tasks = output.tasks as Array<{ id: number; title: string; description?: string; status: 'todo' | 'in_progress' | 'done'; dueDate?: string }>;
      const handleAction = async (action: { name: string; params: Record<string, unknown> }) => {
        await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: action.name, params: action.params }),
        });
      };
      return <TaskList tasks={tasks} onAction={handleAction} />;
    }
    case 'show_meetings': {
      const meetings = output.meetings as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {meetings.map((m, i) => (
            <MeetingCard key={i} title={m.title as string} date={m.date as string} time={m.time as string} attendees={m.attendees as string[]} meetingType={m.meetingType as string} />
          ))}
        </div>
      );
    }
    case 'show_files': {
      const files = output.files as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {files.map((f, i) => (
            <FileCard key={i} name={f.name as string} fileType={f.fileType as string} description={f.description as string} summary={f.summary as string} />
          ))}
        </div>
      );
    }
    case 'show_memories': {
      const memories = output.memories as Array<Record<string, unknown>>;
      return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {memories.map((m, i) => (
            <MemoryCard key={i} category={m.category as string} content={m.content as string} contact={m.contact as string} confidence={m.confidence as 'high' | 'medium' | 'low'} />
          ))}
        </div>
      );
    }
    case 'show_info':
      return <InfoCard title={output.title as string} content={output.content as string} variant={output.variant as 'default' | 'success' | 'warning' | 'error'} />;
    case 'show_table':
      return <DataTable columns={output.columns as Array<{ key: string; label: string }>} rows={output.rows as Array<Record<string, unknown>>} emptyMessage={output.emptyMessage as string} />;
    default:
      return null;
  }
}

export const ChatMessage = React.memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Check if any text content exists
  const textParts = message.parts.filter(p => p.type === 'text' && p.text.trim());
  const hasContent = textParts.length > 0;

  // Check for tool parts
  const toolParts = message.parts.filter(p => p.type.startsWith('tool-'));
  const hasToolResults = toolParts.some(p => 'state' in p && p.state === 'output-available');
  const hasToolPending = toolParts.some(p => 'state' in p && (p.state === 'streaming' || p.state === 'input-available'));

  // Is still streaming (no text content yet for assistant)
  const isThinking = !isUser && !hasContent && !hasToolResults && !hasToolPending;

  if (!isUser && isThinking && message.parts.length === 0) {
    return <ThinkingIndicator />;
  }

  const shouldUseFullWidth = !isUser && hasToolResults;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${shouldUseFullWidth ? 'w-full' : 'max-w-[85%]'} ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and name - only for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Ava</span>
          </div>
        )}

        {/* Render message parts */}
        {message.parts.map((part, index) => {
          // Text parts
          if (part.type === 'text' && part.text.trim()) {
            return (
              <div
                key={index}
                className={`rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-purple-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className={`text-sm leading-relaxed ${isUser ? '' : 'text-gray-700'}`}>
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{part.text}</span>
                  ) : (
                    <Markdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        a: ({ href, children }) => <a href={href} className="text-purple-700 hover:underline">{children}</a>,
                      }}
                    >
                      {part.text}
                    </Markdown>
                  )}
                </div>
              </div>
            );
          }

          // Tool parts - render UI components
          if (part.type.startsWith('tool-')) {
            const toolName = part.type.replace('tool-', '');

            if ('state' in part && part.state === 'output-available' && 'output' in part) {
              return (
                <div key={index} className="mt-3">
                  <ToolResultRenderer toolName={toolName} output={part.output as Record<string, unknown>} />
                </div>
              );
            }

            // Tool is still executing - show loading
            if ('state' in part && (part.state === 'streaming' || part.state === 'input-available')) {
              return <GeneratingUIIndicator key={index} />;
            }
          }

          return null;
        })}

        {/* Timestamp */}
        <p className={`text-[11px] text-gray-400 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(new Date())}
        </p>
      </div>
    </div>
  );
});

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
