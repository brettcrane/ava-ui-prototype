'use client';

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import type { UIMessage } from '@ai-sdk/react';
import {
  renderComponent,
  DashboardSection,
} from './ava-components';

// Tool part states from AI SDK
type ToolState = 'output-available' | 'input-streaming' | 'input-available' | 'output-error' | 'output-denied';

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

// Tool error indicator
function ToolErrorIndicator() {
  return (
    <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      Failed to generate component. Please try again.
    </div>
  );
}

// Validation error for tool results
function ValidationError({ what }: { what: string }) {
  return (
    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
      Unable to display {what}
    </div>
  );
}

// Helper to validate array data from tool output
function validateArrayField(output: Record<string, unknown>, field: string, toolName: string): unknown[] | null {
  const data = output[field];
  if (!Array.isArray(data)) {
    console.error(`${toolName}: expected ${field} array, got:`, typeof data);
    return null;
  }
  return data;
}

// Render tool result as a UI component — delegates to renderComponent/DashboardSection
function ToolResultRenderer({ toolName, result }: { toolName: string; result: unknown }) {
  const output = result as Record<string, unknown>;

  switch (toolName) {
    case 'show_dashboard': {
      const sections = validateArrayField(output, 'sections', toolName);
      if (!sections) return <ValidationError what="dashboard" />;
      return (
        <div className="flex flex-col gap-4">
          {sections.map((section, i) => {
            const s = section as { heading?: string; layout?: string; components?: unknown[] };
            return <DashboardSection key={i} section={{ ...s, components: Array.isArray(s.components) ? s.components as Record<string, unknown>[] : [] }} />;
          })}
        </div>
      );
    }
    case 'show_contacts': {
      const contacts = validateArrayField(output, 'contacts', toolName);
      if (!contacts) return <ValidationError what="contacts" />;
      return <DashboardSection section={{ components: contacts.map((c) => ({ ...(c as Record<string, unknown>), type: 'ContactCard' })) }} />;
    }
    case 'show_opportunity':
      return renderComponent({ ...output, type: 'OpportunityCard' }, 0);
    case 'show_metrics': {
      const metrics = validateArrayField(output, 'metrics', toolName);
      if (!metrics) return <ValidationError what="metrics" />;
      return <DashboardSection section={{ components: metrics.map((m) => ({ ...(m as Record<string, unknown>), type: 'MetricCard' })) }} />;
    }
    case 'show_emails': {
      const emails = validateArrayField(output, 'emails', toolName);
      if (!emails) return <ValidationError what="emails" />;
      return <DashboardSection section={{ components: emails.map((e) => ({ ...(e as Record<string, unknown>), type: 'EmailPreview' })) }} />;
    }
    case 'show_tasks': {
      const tasks = validateArrayField(output, 'tasks', toolName);
      if (!tasks) return <ValidationError what="tasks" />;
      return renderComponent({ type: 'TaskList', tasks }, 0);
    }
    case 'show_meetings': {
      const meetings = validateArrayField(output, 'meetings', toolName);
      if (!meetings) return <ValidationError what="meetings" />;
      return <DashboardSection section={{ components: meetings.map((m) => ({ ...(m as Record<string, unknown>), type: 'MeetingCard' })) }} />;
    }
    case 'show_files': {
      const files = validateArrayField(output, 'files', toolName);
      if (!files) return <ValidationError what="files" />;
      return <DashboardSection section={{ components: files.map((f) => ({ ...(f as Record<string, unknown>), type: 'FileCard' })) }} />;
    }
    case 'show_memories': {
      const memories = validateArrayField(output, 'memories', toolName);
      if (!memories) return <ValidationError what="memories" />;
      return <DashboardSection section={{ components: memories.map((m) => ({ ...(m as Record<string, unknown>), type: 'MemoryCard' })) }} />;
    }
    case 'show_info':
      return renderComponent({ ...output, type: 'InfoCard' }, 0);
    case 'show_table':
      return renderComponent({ ...output, type: 'DataTable' }, 0);
    default:
      console.error(`Unknown tool: ${toolName}`);
      return <ValidationError what={toolName} />;
  }
}

export const ChatMessage = React.memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  // Prefer message.createdAt for restored chats, fallback to render time for new messages
  const [timestamp] = useState(() =>
    ('createdAt' in message && message.createdAt instanceof Date)
      ? message.createdAt
      : new Date()
  );

  // Check if any text content exists
  const textParts = message.parts.filter(p => p.type === 'text' && p.text.trim());
  const hasContent = textParts.length > 0;

  // Check for tool parts
  const toolParts = message.parts.filter(p => p.type.startsWith('tool-'));
  const hasToolResults = toolParts.some(p => 'state' in p && p.state === 'output-available');
  const hasToolPending = toolParts.some(p => 'state' in p && (p.state === 'input-streaming' || p.state === 'input-available'));

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
            const toolPart = part as { state?: ToolState; output?: unknown };

            if (toolPart.state === 'output-available' && toolPart.output != null) {
              return (
                <div key={index} className="mt-3">
                  <ToolResultRenderer toolName={toolName} result={toolPart.output} />
                </div>
              );
            }

            // Tool is still executing - show loading
            if (toolPart.state === 'input-streaming' || toolPart.state === 'input-available') {
              return <GeneratingUIIndicator key={index} />;
            }

            // Tool failed - show error
            if (toolPart.state === 'output-error' || toolPart.state === 'output-denied') {
              return <ToolErrorIndicator key={index} />;
            }
          }

          return null;
        })}

        {/* Timestamp */}
        <p className={`text-[11px] text-gray-400 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
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
