'use client';

import { Renderer } from '@json-render/react';
import Markdown from 'react-markdown';
import { componentRegistry } from './ava-components';
import type { UITree } from '@json-render/core';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ui?: UITree;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Ava</span>
            {message.isStreaming && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                typing
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          {/* Text content */}
          {message.content && (
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
              {message.isStreaming && !message.content && (
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* UI components (only for assistant messages) */}
        {!isUser && message.ui && (
          <div className="mt-3">
            <Renderer
              tree={message.ui}
              registry={componentRegistry}
            />
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[11px] text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
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
