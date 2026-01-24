'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './chat-message';
import { VoiceInput } from './voice-input';
import type { UITree } from '@json-render/core';

// Fallback UUID generator for non-secure contexts
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ui?: UITree;
  timestamp: Date;
  isStreaming?: boolean;
}

interface SavedChat {
  id: number;
  title: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
}

interface StreamChunk {
  type: 'text' | 'ui' | 'tool_use' | 'tool_result' | 'done' | 'error';
  content?: string;
  tree?: UITree;
  toolName?: string;
  error?: string;
}

const SUGGESTED_PROMPTS = [
  'Give me a quick summary of the ESPN deal status',
  'List all contacts at ESPN in a table with their roles and emails',
  'What are the key numbers for the ESPN deal?',
  'Show me Sarah Chen\'s contact details',
  'Show me the ESPN opportunity details',
  'Show me the last email from Jennifer Walsh',
  'What tasks do I have for ESPN?',
  'What meetings do I have coming up?',
  'What documents do we have for the ESPN deal?',
  'What do I know about David Kim\'s preferences and concerns?',
  'I need to create a follow-up task for Sarah Chen',
  'Show me the deal summary with contacts below it',
  'Show me all the key metrics side by side',
  'What\'s the one-line status of this deal?',
  'What stage is the ESPN deal in?',
  'Show me contacts grouped by department',
  'I want to add a new task',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load saved chats on mount
  useEffect(() => {
    loadSavedChats();
  }, []);

  const loadSavedChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chats = await response.json();
        setSavedChats(chats);
      }
    } catch {
      console.error('Failed to load chats');
    }
  };

  const saveChat = async () => {
    if (messages.length === 0) return;

    // Generate title from first user message
    const firstUserMessage = messages.find(m => m.role === 'user');
    const title = firstUserMessage?.content.slice(0, 50) + (firstUserMessage?.content.length! > 50 ? '...' : '') || 'New Chat';

    // Convert messages for storage
    const messagesToSave = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      ui: m.ui,
      timestamp: m.timestamp.toISOString(),
    }));

    try {
      if (currentChatId) {
        // Update existing chat
        await fetch(`/api/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: messagesToSave }),
        });
      } else {
        // Create new chat
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: messagesToSave }),
        });
        if (response.ok) {
          const newChat = await response.json();
          setCurrentChatId(newChat.id);
        }
      }
      await loadSavedChats();
    } catch {
      setError('Failed to save chat');
    }
  };

  const loadChat = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        const loadedMessages: Message[] = JSON.parse(chat.messages_json).map((m: { id: string; role: 'user' | 'assistant'; content: string; ui?: UITree; timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(loadedMessages);
        setCurrentChatId(chatId);
        setShowChatMenu(false);
      }
    } catch {
      setError('Failed to load chat');
    }
  };

  const deleteChatById = async (chatId: number) => {
    if (!confirm('Delete this chat?')) return;

    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      await loadSavedChats();
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
    } catch {
      setError('Failed to delete chat');
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setShowChatMenu(false);
  };

  // Send message to API
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    // Prepare messages for API (convert to Anthropic format)
    // Filter out messages with empty content (except trailing assistant message)
    const apiMessages = [...messages, userMessage]
      .filter((msg) => msg.content.trim() !== '')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let uiTree: UITree | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk: StreamChunk = JSON.parse(line.slice(6));

              switch (chunk.type) {
                case 'text':
                  accumulatedText += chunk.content || '';
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        content: accumulatedText,
                      };
                    }
                    return updated;
                  });
                  break;

                case 'ui':
                  uiTree = chunk.tree;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        ui: uiTree,
                      };
                    }
                    return updated;
                  });
                  break;

                case 'done':
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        isStreaming: false,
                      };
                    }
                    return updated;
                  });
                  break;

                case 'error':
                  setError(chunk.error || 'An error occurred');
                  break;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the assistant placeholder on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading]);

  // Handle suggested prompt click
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          {messages.length > 0 && (
            <button
              onClick={saveChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {currentChatId ? 'Update' : 'Save'}
            </button>
          )}
        </div>

        {/* Saved chats dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowChatMenu(!showChatMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Saved ({savedChats.length})
            <svg className={`w-4 h-4 transition-transform ${showChatMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showChatMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {savedChats.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No saved chats</div>
              ) : (
                savedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group ${
                      currentChatId === chat.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => loadChat(chat.id)}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatById(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
              Hi, I&apos;m Ava
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Your AI teammate here to help you win more deals.
            </p>

            {/* Quick start prompts - just show top 3 in empty state */}
            <div className="w-full max-w-md">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quick start</p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full px-4 py-2.5 text-sm text-purple-800 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 hover:shadow-sm transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Or click <span className="text-purple-600 font-medium">Popular Prompts</span> below for more suggestions
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Popular Prompts Toggle */}
          <div className="mb-3">
            <button
              onClick={() => setShowAllPrompts(!showAllPrompts)}
              className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Popular Prompts
              <svg className={`w-3.5 h-3.5 transition-transform ${showAllPrompts ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Prompts dropdown */}
            {showAllPrompts && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSuggestedPrompt(prompt);
                        setShowAllPrompts(false);
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <VoiceInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
