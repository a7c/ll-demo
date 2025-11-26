import { useState } from 'react';
import type { TranslationResponse } from '../routes/api.translate';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';
import { DropZone } from './DropZone';
import { FlashcardEditor } from './FlashcardEditor';
import type { DraftFlashcard, Flashcard } from '../types/flashcard';

interface TranslationResultProps {
  translation: TranslationResponse;
  onClose: () => void;
  hoveredIndex: number | null;
}

function renderTextWithHighlights(
  text: string,
  chunks: string[],
  colors: string[],
  hoveredIndex: number | null
) {
  let remainingText = text;
  const parts: React.ReactNode[] = [];
  let globalIndex = 0;

  // Sort chunks by their position in the text (longest first to avoid partial matches)
  const sortedChunks = chunks
    .map((chunk, index) => ({ chunk, index, pos: text.indexOf(chunk) }))
    .filter(item => item.pos !== -1)
    .sort((a, b) => a.pos - b.pos);

  let lastIndex = 0;

  sortedChunks.forEach(({ chunk, index, pos }) => {
    // Add text before this chunk
    if (pos > lastIndex) {
      parts.push(
        <span key={`text-${globalIndex++}`}>
          {text.slice(lastIndex, pos)}
        </span>
      );
    }

    // Add the highlighted chunk as a pill
    const isHovered = hoveredIndex === index;
    parts.push(
      <span
        key={`chunk-${index}`}
        className="inline-block px-2 py-0.5 rounded-md font-medium transition-all duration-200"
        style={{
          backgroundColor: isHovered
            ? colors[index]
            : getColorWithOpacity(colors[index], 0.25),
          color: isHovered ? 'white' : 'inherit',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {chunk}
      </span>
    );

    lastIndex = pos + chunk.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${globalIndex++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

export function TranslationResult({ translation, onClose, hoveredIndex }: TranslationResultProps) {
  const [draftFlashcard, setDraftFlashcard] = useState<DraftFlashcard | null>(null);
  const [savedFlashcards, setSavedFlashcards] = useState<Flashcard[]>([]);
  
  const colors = generateChunkColors(translation.chunkPairs.length);
  const translationChunks = translation.chunkPairs.map(pair => pair.translation);

  const handleDrop = (targetWord: string, translation: string) => {
    setDraftFlashcard({ targetWord, translation });
  };

  const handleSaveFlashcard = (flashcard: DraftFlashcard) => {
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      targetWord: flashcard.targetWord,
      translation: flashcard.translation,
      createdAt: Date.now(),
    };
    setSavedFlashcards([...savedFlashcards, newFlashcard]);
    setDraftFlashcard(null);
  };

  const handleCancelFlashcard = () => {
    setDraftFlashcard(null);
  };

  const handleDeleteFlashcard = (id: string) => {
    setSavedFlashcards(savedFlashcards.filter(f => f.id !== id));
  };
  return (
    <div className="animate-fadeIn">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider">
          Translation
        </h3>
        <button
          onClick={onClose}
          className="text-[var(--color-sepia)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Close translation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>


      {/* Natural Translation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4">
        <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-2">
          Natural Translation
        </h4>
        <p className="text-lg leading-relaxed font-medium">
          {translation.naturalTranslation}
        </p>
      </div>

      {/* Direct Translation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4">
        <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-2">
          Direct Translation
        </h4>
        <p className="text-base text-[var(--color-ink-light)] leading-relaxed">
          {renderTextWithHighlights(
            translation.directTranslation,
            translationChunks,
            colors,
            hoveredIndex
          )}
        </p>
      </div>

      {/* Saved Flashcards */}
      {savedFlashcards.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-3">
            Saved Flashcards ({savedFlashcards.length})
          </h4>
          <div className="space-y-2">
            {savedFlashcards.map((flashcard) => (
              <div
                key={flashcard.id}
                className="bg-white rounded-lg p-3 shadow-sm border border-[var(--color-border)] flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-[var(--color-ink)] font-medium mb-1 truncate">
                    {flashcard.targetWord}
                  </div>
                  <div className="text-sm text-[var(--color-ink-light)] truncate">
                    {flashcard.translation}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFlashcard(flashcard.id)}
                  className="text-[var(--color-sepia)] hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Delete flashcard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flashcard Editor or Drop Zone */}
      {draftFlashcard ? (
        <FlashcardEditor
          draft={draftFlashcard}
          onSave={handleSaveFlashcard}
          onCancel={handleCancelFlashcard}
        />
      ) : (
        <DropZone onDrop={handleDrop} />
      )}
    </div>
  );
}
