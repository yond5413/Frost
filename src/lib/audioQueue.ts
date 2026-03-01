// Audio queue manager with prefetch and IndexedDB cache

const DB_NAME = 'frost-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio-blobs';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  blob: Blob;
  timestamp: number;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCached(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry | undefined;
        if (!entry) { resolve(null); return; }
        if (Date.now() - entry.timestamp > TTL_MS) { resolve(null); return; }
        resolve(entry.blob);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCached(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ blob, timestamp: Date.now() } as CacheEntry, key);
  } catch {
    // cache write failure is non-fatal
  }
}

function hashKey(text: string, voiceId: string): string {
  // Simple hash for cache key
  let h = 0;
  const s = text + voiceId;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `${Math.abs(h).toString(36)}_${s.length}`;
}

interface QueueItem {
  text: string;
  voiceId: string;
  fearLevel?: number;
}

export class AudioQueue {
  private queue: QueueItem[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private prefetchController: AbortController | null = null;
  private prefetchedBlob: { key: string; url: string } | null = null;
  private isPlaying = false;

  onLineStart?: (item: QueueItem) => void;
  onLineEnd?: (item: QueueItem) => void;

  enqueue(text: string, voiceId: string, fearLevel = 0): void {
    this.queue.push({ text, voiceId, fearLevel });
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  flush(): void {
    this.queue = [];
    this.prefetchController?.abort();
    this.prefetchController = null;
    if (this.prefetchedBlob) {
      URL.revokeObjectURL(this.prefetchedBlob.url);
      this.prefetchedBlob = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  skip(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.playNext();
  }

  private async playNext(): Promise<void> {
    const item = this.queue.shift();
    if (!item) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    this.onLineStart?.(item);

    const key = hashKey(item.text, item.voiceId);

    // Check prefetch cache first
    let blobUrl: string | null = null;
    if (this.prefetchedBlob?.key === key) {
      blobUrl = this.prefetchedBlob.url;
      this.prefetchedBlob = null;
    }

    if (!blobUrl) {
      const blob = await this.fetchAudio(item, new AbortController().signal);
      if (blob) {
        blobUrl = URL.createObjectURL(blob);
      }
    }

    // Prefetch next item in background
    if (this.queue.length > 0) {
      this.prefetchNext(this.queue[0]);
    }

    if (!blobUrl) {
      // Playback failed, move on
      this.onLineEnd?.(item);
      this.isPlaying = false;
      this.playNext();
      return;
    }

    const audio = new Audio(blobUrl);
    this.currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(blobUrl!);
      this.currentAudio = null;
      this.onLineEnd?.(item);
      this.isPlaying = false;
      // 300ms overlap — start next slightly before this one fully ends
      this.playNext();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(blobUrl!);
      this.currentAudio = null;
      this.onLineEnd?.(item);
      this.isPlaying = false;
      this.playNext();
    };

    audio.play().catch(() => {
      this.isPlaying = false;
      this.onLineEnd?.(item);
      this.playNext();
    });
  }

  private async prefetchNext(item: QueueItem): Promise<void> {
    this.prefetchController?.abort();
    this.prefetchController = new AbortController();
    const key = hashKey(item.text, item.voiceId);
    const blob = await this.fetchAudio(item, this.prefetchController.signal);
    if (blob) {
      this.prefetchedBlob = { key, url: URL.createObjectURL(blob) };
    }
  }

  private async fetchAudio(item: QueueItem, signal: AbortSignal): Promise<Blob | null> {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    const key = hashKey(item.text, item.voiceId);

    // Check IndexedDB cache
    const cached = await getCached(key);
    if (cached) return cached;

    const stability = (item.fearLevel ?? 0) > 60 ? 0.3 : (item.fearLevel ?? 0) > 30 ? 0.45 : 0.65;

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${item.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: item.text,
            voice_settings: { stability, similarity_boost: 0.85 },
          }),
          signal,
        }
      );

      if (!res.ok) return null;
      const blob = await res.blob();
      await setCached(key, blob);
      return blob;
    } catch {
      return null;
    }
  }
}

// Singleton instance for the app
export const audioQueue = new AudioQueue();
