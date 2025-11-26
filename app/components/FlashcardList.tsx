import { useState } from 'react';
import { FlashcardCard } from './FlashcardCard';
import type { Flashcard, DraftFlashcard } from '../types/flashcard';

interface FlashcardListProps {
  flashcards: Flashcard[];
  type: 'new' | 'all';
  onDelete: (id: string) => void;
  onUpdate?: (id: string, draft: DraftFlashcard) => void;
  onStartReview?: () => void;
}

export function FlashcardList({ flashcards, type, onDelete, onUpdate, onStartReview }: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center px-4">
        <div className="text-[var(--color-sepia)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-sm font-medium mb-2">No vocabulary yet</p>
          <p className="text-xs opacity-75">Translate text to create flashcards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          {type === 'new' ? 'New Flashcards' : 'All Flashcards'} ({flashcards.length})
        </h3>
      </div>

      {/* Flashcard Grid */}
      <div className="space-y-3">
        {flashcards.map((flashcard) => {          
          return (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              type={type}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          );
        })}
      </div>

      {/* Study Actions */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex gap-2">
          <button 
            onClick={onStartReview}
            className="flex-1 px-4 py-2 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg cursor-pointer hover:bg-[var(--color-accent-dark)] transition-all shadow-sm hover:shadow-md">
            Study All
          </button>
          <button className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-ink-light)] rounded-lg font-medium hover:bg-[var(--color-parchment)] transition-colors text-sm">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
