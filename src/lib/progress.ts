const STORAGE_KEY = 'ripple-code-progress';

export interface ProgressStore {
  completedChapters: number[];
  journalEntries: { date: string; text: string; chapter: number }[];
  challengeProgress: Record<number, boolean[]>;
}

function defaultStore(): ProgressStore {
  return {
    completedChapters: [],
    journalEntries: [],
    challengeProgress: {},
  };
}

export function getProgress(): ProgressStore {
  if (typeof window === 'undefined') return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultStore(), ...JSON.parse(raw) } : defaultStore();
  } catch {
    return defaultStore();
  }
}

function save(store: ProgressStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function markChapterComplete(chapter: number) {
  const store = getProgress();
  if (!store.completedChapters.includes(chapter)) {
    store.completedChapters.push(chapter);
    save(store);
  }
}

export function isChapterComplete(chapter: number): boolean {
  return getProgress().completedChapters.includes(chapter);
}

export function saveJournalEntry(chapter: number, text: string) {
  const store = getProgress();
  store.journalEntries.push({ date: new Date().toISOString(), text, chapter });
  save(store);
}

export function saveChallengeProgress(chapter: number, progress: boolean[]) {
  const store = getProgress();
  store.challengeProgress[chapter] = progress;
  save(store);
}
