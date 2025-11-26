import { useState } from 'react';
import type { DraftFlashcard } from '../types/flashcard';

interface FlashcardEditorProps {
  draft: DraftFlashcard;
  onSave: (flashcard: DraftFlashcard) => void;
  onCancel: () => void;
}

export function FlashcardEditor({ draft, onSave, onCancel }: FlashcardEditorProps) {
  const [targetWord, setTargetWord] = useState(draft.targetWord);
  const [translation, setTranslation] = useState(draft.translation);

  const handleSave = () => {
    if (targetWord.trim() && translation.trim()) {
      onSave({ targetWord: targetWord.trim(), translation: translation.trim() });
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-[var(--color-accent)] animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[var(--color-ink)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          New Flashcard
        </h4>
        <button
          onClick={onCancel}
          className="text-[var(--color-sepia)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Cancel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-2">
            Target Word/Phrase
          </label>
          <input
            type="text"
            value={targetWord}
            onChange={(e) => setTargetWord(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg font-serif text-base text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder="Enter word or phrase..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-2">
            Translation
          </label>
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-base text-[var(--color-ink-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder="Enter translation..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!targetWord.trim() || !translation.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Flashcard
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-ink-light)] rounded-lg font-medium hover:bg-[var(--color-parchment)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
