import { useState } from 'react';

import type { Flashcard, DraftFlashcard } from '../types/flashcard';

interface FlashcardCardProps {
  flashcard: Flashcard;
  type: 'new' | 'all';
  onDelete: (id: string) => void;
  onUpdate?: (id: string, draft: DraftFlashcard) => void;
}

export function FlashcardCard({ flashcard, type, onDelete, onUpdate }: FlashcardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTargetWord, setEditTargetWord] = useState('');
  const [editTranslation, setEditTranslation] = useState('');

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTargetWord(flashcard.targetWord);
    setEditTranslation(flashcard.translation);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdate) {
      onUpdate(id, { targetWord: editTargetWord, translation: editTranslation });
    }
    setIsEditing(false);
  };
          return (
            <div
              key={flashcard.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all duration-200 group"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-sepia)] mb-1">
                      Target Word
                    </label>
                    <input
                      type="text"
                      value={editTargetWord}
                      onChange={(e) => setEditTargetWord(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg font-serif text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-sepia)] mb-1">
                      Translation
                    </label>
                    <input
                      type="text"
                      value={editTranslation}
                      onChange={(e) => setEditTranslation(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm border border-[var(--color-border)] text-[var(--color-ink-light)] rounded-lg hover:bg-[var(--color-parchment)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(flashcard.id)}
                      className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-dark)] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg text-[var(--color-ink)] font-medium mb-2 leading-tight">
                      {flashcard.targetWord}
                    </div>
                    <div className="text-sm text-[var(--color-ink-light)] leading-relaxed">
                      {flashcard.translation}
                    </div>
                    {type === 'all' && <div className="text-xs text-[var(--color-sepia)] mt-2 opacity-75">
                      Added {new Date(flashcard.createdAt).toLocaleDateString()}
                    </div>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {onUpdate && (
                      <button
                        onClick={() => handleStartEdit()}
                        className="text-[var(--color-sepia)] cursor-pointer hover:text-[var(--color-accent)] transition-colors mt-px"
                        aria-label="Edit flashcard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(flashcard.id)}
                      className="text-[var(--color-sepia)] cursor-pointer hover:text-red-500 transition-colors"
                      aria-label="Delete flashcard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
}