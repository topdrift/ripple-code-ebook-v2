import { useState } from 'preact/hooks';
import { saveJournalEntry } from '../../lib/progress';

interface Props {
  chapter?: number;
  prompt?: string;
  promptText?: string;
}

export default function JournalEntry({ chapter = 0, prompt, promptText }: Props) {
  const displayPrompt = prompt || promptText || 'What ripples did you create today? Write about your experience!';
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!text.trim()) return;
    saveJournalEntry(chapter, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div class="my-6 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl border-2 border-indigo-300 dark:border-indigo-600">
      <h4 class="font-bold text-xl mb-2 text-center text-indigo-700 dark:text-indigo-400" style={{ fontFamily: 'var(--font-display)' }}>
        📝 Ripple Journal
      </h4>
      <p class="text-center text-slate-600 dark:text-slate-400 mb-4">{displayPrompt}</p>

      <textarea
        value={text}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
        placeholder="Write your thoughts here..."
        rows={4}
        class="w-full p-4 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-y focus:outline-none focus:border-indigo-500 transition-colors"
      />

      <div class="flex items-center justify-between mt-3">
        <span class="text-xs text-slate-500">{text.length} characters</span>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          class={`px-5 py-2 font-bold rounded-full transition-all cursor-pointer ${
            saved
              ? 'bg-green-500 text-white'
              : text.trim()
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}
