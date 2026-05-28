'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const subscribeSpeechSupport = () => () => {};
const getSpeechSupportSnapshot = () =>
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const getSpeechSupportServerSnapshot = () => false;

interface VoiceInputProps {
  onSend: (text: string, source: 'voice' | 'text') => void;
  disabled?: boolean;
  placeholder?: string;
  leftSlot?: React.ReactNode;
}

export function VoiceInput({ onSend, disabled = false, placeholder = 'Message Ava, your AI sales agent', leftSlot }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const isSupported = useSyncExternalStore(
    subscribeSpeechSupport,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot,
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition once on mount
  useEffect(() => {
    if (!isSupported) return;
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      console.log('[Voice] Got result:', { final, interim });

      if (final) {
        setTranscript((prev) => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('[Voice] Recognition ended');
    };

    recognition.onaudiostart = () => {
      console.log('[Voice] Audio capture started');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || disabled) return;

    console.log('[Voice] Starting recording...');
    setTranscript('');
    setInterimTranscript('');
    setIsRecording(true);

    try {
      recognitionRef.current.start();
      console.log('[Voice] Recognition started');
    } catch (e) {
      console.error('[Voice] Failed to start:', e);
    }
  }, [disabled]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    console.log('[Voice] Stopping recording...', { transcript, interimTranscript });
    setIsRecording(false);
    recognitionRef.current.stop();

    // Send the final transcript
    const finalText = (transcript + interimTranscript).trim();
    console.log('[Voice] Final text to send:', finalText);
    if (finalText) {
      onSend(finalText, 'voice');
      setTranscript('');
      setInterimTranscript('');
    }
  }, [transcript, interimTranscript, onSend]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (text && !disabled) {
      onSend(text, 'text');
      setTextInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [textInput, onSend, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  }, [handleTextSubmit]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, []);

  const displayText = isRecording ? (transcript + interimTranscript) : textInput;

  return (
    <div className="w-full">
      {/* Live transcription preview */}
      {isRecording && (transcript || interimTranscript) && (
        <div className="mb-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-[13px] text-purple-800">
            <span className="font-medium">Listening: </span>
            {transcript}
            <span className="text-purple-400">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleTextSubmit} className="relative">
        <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl p-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          {/* Left slot (e.g., popular prompts popover) */}
          {leftSlot}

          {/* Voice button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled}
              className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={isRecording ? displayText : textInput}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening...' : placeholder}
            disabled={disabled || isRecording}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none text-sm py-2 px-2"
            style={{ minHeight: '40px', maxHeight: '150px' }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || (!textInput.trim() && !isRecording)}
            className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
              textInput.trim() && !disabled
                ? 'bg-purple-700 text-white hover:bg-purple-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Helper text */}
      <p className="mt-2 text-[11px] text-gray-400 text-center">
        {isSupported
          ? isRecording
            ? 'Click the mic again to stop and send'
            : 'Press Enter to send, Shift+Enter for new line, or use voice'
          : 'Press Enter to send, Shift+Enter for new line'}
      </p>
    </div>
  );
}
