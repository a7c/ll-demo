import { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import type { TranslationResponse } from '../routes/api.translate';
import type { PartialTranslation, LiteralPart } from '../utils/xmlParser';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';
import { DropZone } from './DropZone';
import { FlashcardEditor } from './FlashcardEditor';
import type { DraftFlashcard, Flashcard } from '../types/flashcard';
import { createFlashcard } from '../utils/flashcard';

interface TranslationResultProps {
  translation: TranslationResponse | null;
  partialTranslation: PartialTranslation | null;
  onClose: () => void;
  hoveredIndex: number | null;
  savedFlashcards: Flashcard[];
  onSaveFlashcard: (flashcard: DraftFlashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  isStreaming: boolean;
}

interface ChunkColorMap {
  [sourceWord: string]: { color: string; index: number };
}

function buildColorMap(chunkPairs: { original: string; translation: string }[], colors: string[]): ChunkColorMap {
  const map: ChunkColorMap = {};
  chunkPairs.forEach((pair, idx) => {
    // lowercase for case-insensitive lookup
    map[pair.original.toLowerCase()] = { color: colors[idx], index: idx };
  });
  return map;
}

function getColorForSourceWord(sourceWord: string, colorMap: ChunkColorMap): { color: string; index: number } | null {
  return colorMap[sourceWord.toLowerCase()] || null;
}

export function TranslationResult({ 
  translation, 
  partialTranslation,
  onClose, 
  hoveredIndex, 
  savedFlashcards, 
  onSaveFlashcard, 
  onDeleteFlashcard,
  isStreaming }: TranslationResultProps) {
  const [draftFlashcard, setDraftFlashcard] = useState<DraftFlashcard | null>(null);
  const [currentTranslationFlashcards, setCurrentTranslationFlashcards] = useState<Flashcard[]>([]);

  // use partial translation if we're streaming 
  const data = isStreaming ? partialTranslation : translation;
  const chunkPairs = data?.chunkPairs || [];
  const naturalTranslation = data?.naturalTranslation || '';
  const literalParts = (isStreaming ? partialTranslation?.literalParts : translation?.literalParts) || [];
  // wait for literal translation to be complete before showing it
  const literalIsComplete = isStreaming ? (partialTranslation?.isComplete ?? false) : true;
  const showLiteralTranslation = literalParts.length > 0 && literalIsComplete;

  const colors = generateChunkColors(chunkPairs.length);
  const colorMap = buildColorMap(chunkPairs, colors);

  const handleDrop = (targetWord: string, translation: string) => {
    setDraftFlashcard({ targetWord, translation });
  };

  const handleSaveFlashcard = (flashcard: DraftFlashcard) => {
    const newFlashcard = createFlashcard(flashcard);
    
    // Add to both the global list and current translation list
    onSaveFlashcard(flashcard);
    setCurrentTranslationFlashcards([...currentTranslationFlashcards, newFlashcard]);
    setDraftFlashcard(null);
  };

  const handleCancelFlashcard = () => {
    setDraftFlashcard(null);
  };

  const handleDeleteCurrentFlashcard = (id: string) => {
    // Remove from both lists
    onDeleteFlashcard(id);
    setCurrentTranslationFlashcards(currentTranslationFlashcards.filter(f => f.id !== id));
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


      {/* Idiomatic Translation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider">
            Idiomatic Translation
          </h4>
          {isStreaming && naturalTranslation && (
            <span className="inline-block w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
          )}
        </div>
        {naturalTranslation ? (
          <p className="text-lg leading-relaxed font-medium">
            {naturalTranslation}
          </p>
        ) : isStreaming ? (
          <div className="h-6 bg-gray-100 rounded animate-pulse" />
        ) : null}
      </div>

      {/* Literal Translation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider">
            Literal Translation
          </h4>
          {isStreaming && chunkPairs.length > 0 && !showLiteralTranslation && (
            <span className="inline-block w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
          )}
        </div>

        <LayoutGroup>
          {chunkPairs.length > 0 && !showLiteralTranslation && (
            <div className="flex flex-wrap gap-1 text-base leading-relaxed">
              {chunkPairs.map((pair, idx) => (
                <motion.span
                  key={pair.original}
                  layoutId={`word-${pair.original.toLowerCase()}-0`}
                  className="inline-block px-2 py-0.5 rounded-md font-medium"
                  style={{ backgroundColor: getColorWithOpacity(colors[idx], 0.25) }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  {pair.translation}
                </motion.span>
              ))}
            </div>
          )}

          {showLiteralTranslation && (
            <p className="text-base text-[var(--color-ink-light)] leading-relaxed">
              {(() => {
                const occurrenceCount: Record<string, number> = {};

                return literalParts.map((part, idx) => {
                  if (part.type === 'text') {
                    return <span key={`text-${idx}`}>{part.content}</span>;
                  }

                  const colorInfo = part.sourceWord ? getColorForSourceWord(part.sourceWord, colorMap) : null;
                  const isHovered = colorInfo ? hoveredIndex === colorInfo.index : false;
                  const key = part.sourceWord?.toLowerCase() || '';
                  const occurrence = occurrenceCount[key] || 0;
                  occurrenceCount[key] = occurrence + 1;
                  const isFirstOccurrence = occurrence === 0;

                  if (isFirstOccurrence && key) {
                    return (
                      <motion.span
                        key={`word-${idx}-${part.sourceWord}-${occurrence}`}
                        layoutId={`word-${key}-0`}
                        className="inline-block px-2 py-0.5 rounded-md font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: colorInfo
                            ? (isHovered ? colorInfo.color : getColorWithOpacity(colorInfo.color, 0.25))
                            : 'transparent',
                          color: isHovered ? 'white' : 'inherit',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      >
                        {part.content}
                      </motion.span>
                    );
                  }

                  return (
                    <span
                      key={`word-${idx}-${part.sourceWord}-${occurrence}`}
                      className="inline-block px-2 py-0.5 rounded-md font-medium transition-colors duration-200"
                      style={{
                        backgroundColor: colorInfo
                          ? (isHovered ? colorInfo.color : getColorWithOpacity(colorInfo.color, 0.25))
                          : 'transparent',
                        color: isHovered ? 'white' : 'inherit',
                      }}
                    >
                      {part.content}
                    </span>
                  );
                });
              })()}
            </p>
          )}
        </LayoutGroup>

        {isStreaming && chunkPairs.length === 0 && !showLiteralTranslation && (
          <div className="h-6 bg-gray-100 rounded animate-pulse" />
        )}
      </div>

      {/* Saved Flashcards - only show when not streaming */}
      {!isStreaming && currentTranslationFlashcards.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-3">
            New Flashcards ({currentTranslationFlashcards.length})
          </h4>
          <div className="space-y-2">
            {currentTranslationFlashcards.map((flashcard) => (
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
                  onClick={() => handleDeleteCurrentFlashcard(flashcard.id)}
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

      {/* Flashcard Editor or Drop Zone - only show when not streaming */}
      {!isStreaming && (
        draftFlashcard ? (
          <FlashcardEditor
            draft={draftFlashcard}
            onSave={handleSaveFlashcard}
            onCancel={handleCancelFlashcard}
          />
        ) : (
          <DropZone onDrop={handleDrop} />
          )
      )}
    </div>
  );
}
