import { useState, useCallback, useEffect } from "react";

export interface HistoryEntry {
  url: string;
  title: string;
  thumbnail: string;
  platform: string;
  duration: number;
  uploader: string;
  downloadedAt: number;
}

const STORAGE_KEY = "grabber-history";
const MAX_ENTRIES = 20;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "downloadedAt">) => {
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.url !== entry.url);
        return [{ ...entry, downloadedAt: Date.now() }, ...filtered].slice(
          0,
          MAX_ENTRIES,
        );
      });
    },
    [],
  );

  const removeEntry = useCallback((url: string) => {
    setHistory((prev) => prev.filter((e) => e.url !== url));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
