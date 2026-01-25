'use client';

import { Renderer, ActionProvider } from '@json-render/react';
import Markdown from 'react-markdown';
import { componentRegistry } from './ava-components';
import type { UITree } from '@json-render/core';
import { useMemo } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ui?: UITree;
  timestamp: Date;
  isStreaming?: boolean;
  isGeneratingUI?: boolean;
}

interface ChatMessageProps {
  message: Message;
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

// Component generation indicator - shows after text, before UI
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

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isThinking = message.isStreaming && !message.content;
  const hasContent = message.content.length > 0;
  // Show loader until we have actual renderable elements (not just a root key)
  const hasRenderableUI = message.ui?.root && message.ui.elements && Object.keys(message.ui.elements).length > 0;
  const showGeneratingIndicator = message.isGeneratingUI && !hasRenderableUI;

  // Action handlers keyed by name — each forwards to the API
  const actionHandlers = useMemo(() => {
    const actionNames = [
      'complete_task', 'update_task_status', 'create_task', 'delete_task',
      'create_contact', 'delete_contact',
      'update_opportunity_stage', 'update_close_date',
      'save_memory', 'draft_email', 'schedule_meeting',
    ] as const;

    const handlers: Record<string, (params: Record<string, unknown>) => Promise<void>> = {};
    for (const name of actionNames) {
      handlers[name] = async (params) => {
        await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: name, params }),
        });
      };
    }
    return handlers;
  }, []);

  // For assistant messages that are still thinking (no content yet), show thinking indicator
  if (!isUser && isThinking) {
    return <ThinkingIndicator />;
  }

  // Assistant messages with UI should use full width, others can shrink to fit
  const shouldUseFullWidth = !isUser && message.ui;

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
            {message.isStreaming && hasContent && (
              <span className="flex items-center gap-1.5 text-[11px] text-purple-600">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                typing
              </span>
            )}
          </div>
        )}

        {/* Message content - only show if there's content */}
        {hasContent && (
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-purple-700 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            <div className={`text-sm leading-relaxed ${isUser ? '' : 'text-gray-700'}`}>
              {isUser ? (
                <span className="whitespace-pre-wrap">{message.content}</span>
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
                  {message.content}
                </Markdown>
              )}
            </div>
          </div>
        )}

        {/* Generating UI indicator - shows when text is done but UI is being generated */}
        {!isUser && showGeneratingIndicator && <GeneratingUIIndicator />}

        {/* UI components (only for assistant messages) */}
        {!isUser && message.ui && (
          <div className="mt-3">
            <ActionProvider handlers={actionHandlers}>
              <Renderer
                tree={message.ui}
                registry={componentRegistry}
              />
            </ActionProvider>
          </div>
        )}

        {/* Timestamp - only show when not actively streaming/generating */}
        {(!message.isStreaming && !showGeneratingIndicator) && (
          <p className={`text-[11px] text-gray-400 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
