// Browser-only Kokoro TTS singleton.
//
// kokoro-js loads ~80MB of model weights from the Hugging Face Hub on first
// use; we keep one instance for the page's lifetime so subsequent utterances
// are fast. The dynamic import is on the call path so the bundler keeps it in
// a separate chunk and doesn't pay the weight on first paint.

import type { GenerateOptions, KokoroTTS } from "kokoro-js";

type KokoroVoice = NonNullable<GenerateOptions["voice"]>;

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_VOICE: KokoroVoice = "af_heart"; // Grade A American female

export type LoadProgress = {
  status: "idle" | "loading" | "ready" | "error";
  percent: number; // 0-100, only meaningful while loading
  message?: string;
};

type ProgressListener = (p: LoadProgress) => void;

let ttsPromise: Promise<KokoroTTS> | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let lastProgress: LoadProgress = { status: "idle", percent: 0 };
const listeners = new Set<ProgressListener>();

function emit(next: LoadProgress) {
  lastProgress = next;
  for (const l of listeners) l(next);
}

export function subscribeKokoroProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  listener(lastProgress);
  return () => {
    listeners.delete(listener);
  };
}

export function getKokoroProgress(): LoadProgress {
  return lastProgress;
}

function pickDevice(): "webgpu" | "wasm" {
  if (typeof navigator !== "undefined" && "gpu" in navigator) return "webgpu";
  return "wasm";
}

async function loadTTS(): Promise<KokoroTTS> {
  if (ttsPromise) return ttsPromise;

  const device = pickDevice();
  // fp32 is recommended for webgpu; q8 keeps the wasm download/runtime small.
  const dtype = device === "webgpu" ? "fp32" : "q8";
  emit({ status: "loading", percent: 0, message: `Loading voice model (${device})…` });

  ttsPromise = (async () => {
    try {
      const { KokoroTTS } = await import("kokoro-js");
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype,
        device,
        // Transformers.js fires progress events per-file; we surface the
        // current file's percentage so the user sees movement.
        progress_callback: (info: unknown) => {
          const evt = info as { status?: string; progress?: number; file?: string };
          if (evt?.status === "progress" && typeof evt.progress === "number") {
            emit({
              status: "loading",
              percent: Math.round(evt.progress),
              message: evt.file ? `Downloading ${evt.file}…` : "Downloading…",
            });
          }
        },
      });
      emit({ status: "ready", percent: 100 });
      return tts;
    } catch (err) {
      ttsPromise = null;
      const message = err instanceof Error ? err.message : "Unknown error";
      emit({ status: "error", percent: 0, message });
      throw err;
    }
  })();

  return ttsPromise;
}

export function preloadKokoro(): void {
  void loadTTS().catch(() => {});
}

function disposeCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export function cancelKokoro(): void {
  disposeCurrent();
}

export async function speakWithKokoro(text: string, voice: KokoroVoice = DEFAULT_VOICE): Promise<void> {
  if (!text.trim()) return;
  const tts = await loadTTS();
  const audio = await tts.generate(text, { voice });
  const blob = audio.toBlob();

  // Cancel any prior playback before starting the new one.
  disposeCurrent();

  const url = URL.createObjectURL(blob);
  currentObjectUrl = url;
  const el = new Audio(url);
  currentAudio = el;
  el.onended = () => {
    if (currentAudio === el) disposeCurrent();
  };
  el.onerror = () => {
    if (currentAudio === el) disposeCurrent();
  };
  await el.play();
}
