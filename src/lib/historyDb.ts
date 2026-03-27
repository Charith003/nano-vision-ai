import type { AnalysisResult } from "@/lib/mockAnalysis";

export interface AnalysisHistoryEntry {
  id: string;
  createdAt: string;
  imageName: string;
  imageData: string;
  result: AnalysisResult;
  optimizedResult?: AnalysisResult;
  optimizedImageData?: string;
  optimizedName?: string;
}

const STORAGE_KEY = "nano-vision-history-v1";
const HISTORY_UPDATED_EVENT = "nano-history-updated";

function notifyHistoryUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  }
}

export function getHistoryEntries(): AnalysisHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: AnalysisHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addHistoryEntry(entry: Omit<AnalysisHistoryEntry, "id" | "createdAt">): AnalysisHistoryEntry {
  const next: AnalysisHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const existing = getHistoryEntries();
  const updated = [next, ...existing].slice(0, 100);
  saveEntries(updated);
  notifyHistoryUpdated();
  return next;
}

export function updateHistoryEntry(id: string, updater: (entry: AnalysisHistoryEntry) => AnalysisHistoryEntry): AnalysisHistoryEntry | null {
  const entries = getHistoryEntries();
  const idx = entries.findIndex((entry) => entry.id === id);
  if (idx === -1) return null;
  entries[idx] = updater(entries[idx]);
  saveEntries(entries);
  notifyHistoryUpdated();
  return entries[idx];
}

export function getHistoryEntryById(id: string): AnalysisHistoryEntry | null {
  return getHistoryEntries().find((entry) => entry.id === id) ?? null;
}

export function deleteHistoryEntry(id: string): boolean {
  const entries = getHistoryEntries();
  const filtered = entries.filter((entry) => entry.id !== id);
  if (filtered.length === entries.length) return false;
  saveEntries(filtered);
  notifyHistoryUpdated();
  return true;
}

export function clearHistoryEntries() {
  localStorage.removeItem(STORAGE_KEY);
  notifyHistoryUpdated();
}

export { HISTORY_UPDATED_EVENT };
