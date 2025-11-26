import { motion, LayoutGroup } from 'framer-motion';
import type { TranslationResponse } from '../routes/api.translate';
import type { PartialTranslation, LiteralPart } from '../utils/xmlParser';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';
import { FlashcardList } from './FlashcardList';
import type { DraftFlashcard, Flashcard } from '../types/flashcard';

interface TranslationResultProps {
  translation: TranslationResponse | null;
  partialTranslation: PartialTranslation | null;
  onClose: () => void;
  hoveredIndex: number | null;
  savedFlashcards: Flashcard[];
  onSaveFlashcard: (flashcard: DraftFlashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onUpdateFlashcard: (id: string, draft: DraftFlashcard) => void;
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
  onUpdateFlashcard,
  isStreaming }: TranslationResultProps) {
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

  // TODO: This should work by flashcard id instead
  // Filter flashcards that match the current translation's chunk pairs
  const currentTranslationFlashcards = savedFlashcards.filter(flashcard => 
    chunkPairs.some(pair => 
      pair.original.toLowerCase() === flashcard.targetWord.toLowerCase()
    )
  );

  return (
    <div className="animate-fadeIn flex flex-col h-full">
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

      <div className="flex-1 flex flex-col overflow-y-auto">
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

        {/* New Vocabulary - only show when not streaming */}
        {!isStreaming && currentTranslationFlashcards.length > 0 && (
          <div className="mb-4">
            <FlashcardList
              flashcards={currentTranslationFlashcards}
              type="new"
              onDelete={onDeleteFlashcard}
              onUpdate={onUpdateFlashcard}
            />
          </div>
        )}

      </div>
    </div>
  );
}
