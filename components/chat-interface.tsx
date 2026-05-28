'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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
  SparklesIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import {
  cancelKokoro,
  preloadKokoro,
  speakWithKokoro,
  subscribeKokoroProgress,
  type LoadProgress,
} from '@/lib/kokoro-tts';

interface SavedChat {
  id: number;
  title: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
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

const chatTransport = new DefaultChatTransport({ api: '/api/generate' });

function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(\S[^*]*?\S|\S)\*\*/g, '$1')
    .replace(/\*(\S[^*]*?\S|\S)\*/g, '$1')
    .replace(/__(\S[^_]*?\S|\S)__/g, '$1')
    .replace(/_(\S[^_]*?\S|\S)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^\s*\|?[\s\-:|]*\|[\s\-:|]*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const PREFERRED_VOICE_NAMES = [
  'Zoe (Premium)',
  'Ava (Premium)',
  'Samantha (Enhanced)',
  'Google US English',
  'Samantha',
];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith('en') && v.default) ?? null;
}

function speakWithBrowser(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

type VoiceMode = 'standard' | 'premium';
const VOICE_MODE_KEY = 'ava:voiceMode';

async function speakAssistantText(text: string, mode: VoiceMode) {
  const clean = stripMarkdownForSpeech(text);
  if (!clean) return;

  // Always cancel whichever engine is currently producing audio.
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  cancelKokoro();

  if (mode === 'premium') {
    try {
      await speakWithKokoro(clean);
      return;
    } catch (err) {
      console.warn('[Voice] Kokoro failed, falling back to browser TTS:', err);
      // Fall through to the browser engine so the demo still talks back.
    }
  }
  speakWithBrowser(clean);
}

function VoiceModeToggle({
  mode,
  onChange,
  progress,
}: {
  mode: VoiceMode;
  onChange: (next: VoiceMode) => void;
  progress: LoadProgress;
}) {
  const isPremium = mode === 'premium';
  const isLoading = isPremium && progress.status === 'loading';
  const isError = isPremium && progress.status === 'error';

  const label = isLoading
    ? `Loading${progress.percent ? ` ${progress.percent}%` : ''}…`
    : isError
      ? 'Premium failed'
      : isPremium
        ? 'Premium'
        : 'Standard';

  const title = isError
    ? `Kokoro failed to load: ${progress.message ?? 'unknown error'}. Click to retry.`
    : isPremium
      ? 'Using Kokoro (in-browser neural TTS). Click to switch to OS voice.'
      : 'Using OS voice. Click to switch to Kokoro neural voice.';

  return (
    <button
      type="button"
      onClick={() => onChange(isPremium ? 'standard' : 'premium')}
      title={title}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
        isError
          ? 'text-red-600 hover:bg-red-50'
          : isPremium
            ? 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {isPremium ? (
        <SparklesIcon className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
      ) : (
        <SpeakerWaveIcon className="w-4 h-4" />
      )}
      <span>Voice: {label}</span>
    </button>
  );
}

export function ChatInterface() {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('standard');
  const [kokoroProgress, setKokoroProgress] = useState<LoadProgress>({ status: 'idle', percent: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveChatRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const lastInputSourceRef = useRef<'voice' | 'text'>('text');
  const spokenMessageIdRef = useRef<string | null>(null);
  const voiceModeRef = useRef<VoiceMode>('standard');

  // Hydrate voice mode preference from localStorage on mount, and subscribe
  // to Kokoro loader progress. The setState happens after a localStorage
  // read which can't run during SSR, so the lint rule's preference for an
  // initializer doesn't apply here.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(VOICE_MODE_KEY);
    if (saved === 'premium' || saved === 'standard') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceMode(saved);
      voiceModeRef.current = saved;
      if (saved === 'premium') preloadKokoro();
    }
    return subscribeKokoroProgress(setKokoroProgress);
  }, []);

  const updateVoiceMode = useCallback((next: VoiceMode) => {
    setVoiceMode(next);
    voiceModeRef.current = next;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOICE_MODE_KEY, next);
    }
    // Stop any in-flight playback so the mode flip takes effect immediately.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    cancelKokoro();
    // Start the ~80MB model fetch the moment the user opts in so the
    // progress UI shows up and the first utterance feels snappier.
    if (next === 'premium') preloadKokoro();
  }, []);

  const resetSpeechState = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    cancelKokoro();
    lastInputSourceRef.current = 'text';
    spokenMessageIdRef.current = null;
  }, []);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
  } = useChat({
    transport: chatTransport,
    experimental_throttle: 50,
    onFinish: () => {
      saveChatRef.current?.();
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Throttled auto-scroll to bottom
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const loadSavedChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        console.error(`Failed to load chats: ${response.status} ${response.statusText}`);
        return;
      }
      const chats = await response.json();
      setSavedChats(chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, []);

  // Load saved chats on mount. The setState happens after `await`, not
  // synchronously in the effect body — React's docs endorse useEffect for
  // mount-time fetches in client components, so the rule is too strict here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSavedChats();
  }, [loadSavedChats]);

  const saveChat = useCallback(async () => {
    if (messages.length === 0) return;

    const firstUserMessage = messages.find(m => m.role === 'user');
    const firstUserText = firstUserMessage?.parts?.find((p): p is { type: 'text'; text: string } => p.type === 'text')?.text || '';
    const title = firstUserText.slice(0, 50) + (firstUserText.length > 50 ? '...' : '') || 'New Chat';

    // Serialize messages for storage
    const msgsForStorage = messages.map(m => ({
      id: m.id,
      role: m.role,
      parts: m.parts,
    }));

    try {
      if (currentChatId) {
        await fetch(`/api/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: msgsForStorage }),
        });
      } else {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: msgsForStorage }),
        });
        if (response.ok) {
          const newChat = await response.json();
          setCurrentChatId(newChat.id);
        }
      }
      await loadSavedChats();
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, [messages, currentChatId, loadSavedChats]);

  // Keep ref in sync for onFinish callback
  useEffect(() => {
    saveChatRef.current = saveChat;
  }, [saveChat]);

  const loadChat = async (chatId: number) => {
    resetSpeechState();
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        console.error(`Failed to load chat ${chatId}: ${response.status} ${response.statusText}`);
        setOperationError('Failed to load chat. Please try again.');
        return;
      }
      const chat = await response.json();
      const loadedMessages = JSON.parse(chat.messages_json).map((m: Record<string, unknown>) => {
        // Validate/migrate message structure: old format used content, new uses parts
        const parts = Array.isArray(m.parts) ? m.parts :
          typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : [];
        return {
          ...m,
          parts,
          createdAt: m.createdAt ? new Date(m.createdAt as string) : new Date(),
        };
      });
      setMessages(loadedMessages);
      setCurrentChatId(chatId);
      setShowChatMenu(false);
      setOperationError(null);
    } catch (error) {
      console.error(`Failed to load chat ${chatId}:`, error);
      const message = error instanceof SyntaxError
        ? 'Chat data appears corrupted'
        : 'Failed to load chat. Please check your connection.';
      setOperationError(message);
    }
  };

  const deleteChatById = async (chatId: number) => {
    if (!confirm('Delete this chat?')) return;
    try {
      const response = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (!response.ok) {
        console.error(`Failed to delete chat ${chatId}: ${response.status} ${response.statusText}`);
        setOperationError('Failed to delete chat. Please try again.');
        return;
      }
      await loadSavedChats();
      if (currentChatId === chatId) {
        resetSpeechState();
        setMessages([]);
        setCurrentChatId(null);
      }
      setOperationError(null);
    } catch (error) {
      console.error(`Failed to delete chat ${chatId}:`, error);
      setOperationError('Failed to delete chat. Please try again.');
    }
  };

  const startNewChat = () => {
    resetSpeechState();
    setMessages([]);
    setCurrentChatId(null);
    setShowChatMenu(false);
    setOperationError(null);
  };

  const handleSend = useCallback((text: string, source: 'voice' | 'text' = 'text') => {
    if (!text.trim() || isLoading) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    cancelKokoro();
    lastInputSourceRef.current = source;
    sendMessage({ text });
  }, [isLoading, sendMessage]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    handleSend(prompt, 'text');
  }, [handleSend]);

  // Speak Ava's reply when the user's last turn came in by voice.
  // Fires when every text part is marked 'done' (so components can still
  // be streaming/rendering, but the spoken portion is complete) — the AI
  // SDK sets state='done' on a text part once Claude stops appending to
  // it. Falls back to status === 'ready' for messages whose parts don't
  // expose state (e.g. loaded from storage).
  useEffect(() => {
    if (lastInputSourceRef.current !== 'voice') return;
    if (status === 'submitted') return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (spokenMessageIdRef.current === last.id) return;

    type TextPart = { type: 'text'; text: string; state?: 'streaming' | 'done' };
    const textParts = last.parts.filter(
      (p): p is TextPart => p.type === 'text',
    );
    if (textParts.length === 0) return;

    const allTextDone = textParts.every((p) => p.state === 'done');
    if (!allTextDone && status !== 'ready') return;

    const text = textParts.map((p) => p.text).join(' ').trim();
    if (!text) return;

    spokenMessageIdRef.current = last.id;
    void speakAssistantText(text, voiceModeRef.current);
  }, [status, messages]);

  // Stop any in-flight speech when leaving the page.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      cancelKokoro();
    };
  }, []);

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

          <VoiceModeToggle
            mode={voiceMode}
            onChange={updateVoiceMode}
            progress={kokoroProgress}
          />
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
      {(error || operationError) && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between">
          <p className="text-sm text-red-600">{error?.message || operationError}</p>
          {operationError && (
            <button onClick={() => setOperationError(null)} className="text-xs text-red-500 hover:text-red-700 underline ml-2">
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <VoiceInput
            onSend={handleSend}
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
