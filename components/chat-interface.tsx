'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './chat-message';
import { VoiceInput } from './voice-input';
import { PopularPromptsPopover } from './popular-prompts-popover';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
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
  isGeneratingUI?: boolean;
}

interface SavedChat {
  id: number;
  title: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
}

interface StreamChunk {
  type: 'text' | 'ui_start' | 'patch' | 'done' | 'error';
  content?: string;
  patch?: { op: string; path: string; value: unknown };
  error?: string;
}

// Apply a JSONL patch to build the UI tree
function applyPatch(tree: UITree | null, patch: { op: string; path: string; value: unknown }): UITree {
  const newTree: UITree = tree ? { ...tree, elements: { ...tree.elements } } : { root: '', elements: {} };

  if (patch.op === 'set' && patch.path === '/root') {
    newTree.root = patch.value as string;
  } else if (patch.op === 'add' && patch.path.startsWith('/elements/')) {
    const key = patch.path.replace('/elements/', '');
    newTree.elements[key] = patch.value as UITree['elements'][string];
  }

  return newTree;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSavedChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chats = await response.json();
        setSavedChats(chats);
      }
    } catch {
      console.error('Failed to load chats');
    }
  }, []);

  // Load saved chats on mount
  useEffect(() => {
    loadSavedChats();
  }, [loadSavedChats]);

  const saveChat = useCallback(async (messagesToSave?: Message[], chatId?: number | null) => {
    const msgs = messagesToSave || messages;
    const id = chatId !== undefined ? chatId : currentChatId;

    if (msgs.length === 0) return;

    // Generate title from first user message
    const firstUserMessage = msgs.find(m => m.role === 'user');
    const title = firstUserMessage?.content.slice(0, 50) + (firstUserMessage?.content.length! > 50 ? '...' : '') || 'New Chat';

    // Convert messages for storage
    const msgsForStorage = msgs.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      ui: m.ui,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));

    try {
      if (id) {
        // Update existing chat
        await fetch(`/api/chats/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: msgsForStorage }),
        });
        return id;
      } else {
        // Create new chat
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: msgsForStorage }),
        });
        if (response.ok) {
          const newChat = await response.json();
          setCurrentChatId(newChat.id);
          await loadSavedChats();
          return newChat.id;
        }
      }
      await loadSavedChats();
    } catch {
      // Silent fail for auto-save, don't show error to user
    }
    return null;
  }, [messages, currentChatId, loadSavedChats]);

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
      const response = await fetch('/api/generate', {
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
      let uiTree: UITree | null = null;

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

                case 'ui_start':
                  // UI generation starting - show indicator
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        isStreaming: false,
                        isGeneratingUI: true,
                      };
                    }
                    return updated;
                  });
                  break;

                case 'patch':
                  // Apply JSONL patch to progressively build UI
                  if (chunk.patch) {
                    uiTree = applyPatch(uiTree, chunk.patch);
                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIdx = updated.length - 1;
                      if (updated[lastIdx]?.role === 'assistant') {
                        updated[lastIdx] = {
                          ...updated[lastIdx],
                          ui: uiTree || undefined,
                          isGeneratingUI: true, // Still generating
                        };
                      }
                      return updated;
                    });
                  }
                  break;

                case 'done':
                  // Update messages and auto-save
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.role === 'assistant') {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        content: accumulatedText,
                        ui: uiTree || undefined,
                        isStreaming: false,
                        isGeneratingUI: false,
                      };
                    }
                    // Auto-save after state update
                    setTimeout(() => {
                      saveChat(updated, currentChatId);
                    }, 0);
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
  }, [messages, isLoading, saveChat, currentChatId]);

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
            <PlusIcon className="w-4 h-4" />
            New Chat
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => saveChat()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {currentChatId ? 'Saved' : 'Save'}
            </button>
          )}
        </div>

        {/* Saved chats dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowChatMenu(!showChatMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            Saved ({savedChats.length})
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showChatMenu ? 'rotate-180' : ''}`} />
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
                      <TrashIcon className="w-4 h-4" />
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
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-purple-700" strokeWidth={1.5} />
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
                Or click the <span className="text-purple-600 font-medium">lightbulb icon</span> in the input bar for more suggestions
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <VoiceInput
            onSend={sendMessage}
            disabled={isLoading}
            leftSlot={
              <PopularPromptsPopover
                onSelectPrompt={handleSuggestedPrompt}
                disabled={isLoading}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
