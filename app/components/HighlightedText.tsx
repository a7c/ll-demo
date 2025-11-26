import { useState, useEffect } from 'react';
import type { TranslationResponse } from '../routes/api.translate';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';

interface HighlightedTextProps {
  text: string;
  translation: TranslationResponse | null;
  previousTranslations?: TranslationResponse[];
  onHoverChange?: (index: number | null) => void;
  renderParagraphs?: boolean;
}

function indexOfIgnoreCase(text: string, search: string): number {
  return text.toLowerCase().indexOf(search.toLowerCase());
}

export function HighlightedText({ text, translation, previousTranslations = [], onHoverChange, renderParagraphs = true }: HighlightedTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndices, setClickedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    // clear toggled chunks upon translation change
    setClickedIndices(new Set());
  }, [translation]);

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    onHoverChange?.(index);
  };

  const handleClick = (index: number) => {
    setClickedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // If no translation, check for previous translations
  if (!translation && previousTranslations.length === 0) {
    return <>{text}</>;
  }

  // Combine current and previous translations
  const allTranslations = translation ? [translation, ...previousTranslations] : previousTranslations;

  // Build a map of all chunks with their metadata
  interface ChunkInfo {
    chunk: string;
    chunkIndex: number;
    translationIndex: number;
    absolutePos: number;
    color: string;
    translation: string;
    isCurrent: boolean;
  }

  const allChunks: ChunkInfo[] = [];

  allTranslations.forEach((trans, transIndex) => {
    const isCurrent = transIndex === 0;
    const translationStartPos = indexOfIgnoreCase(text, trans.original);
    
    if (translationStartPos === -1) {
      return; // Skip if this translation isn't in this paragraph
    }

    const colors = generateChunkColors(trans.chunkPairs.length);
    
    trans.chunkPairs.forEach((pair, chunkIndex) => {
      const pos = indexOfIgnoreCase(trans.original, pair.original);
      if (pos !== -1) {
        allChunks.push({
          chunk: pair.original,
          chunkIndex,
          translationIndex: transIndex,
          absolutePos: translationStartPos + pos,
          color: colors[chunkIndex],
          translation: pair.translation,
          isCurrent
        });
      }
    });
  });

  // Sort chunks by position and remove overlaps (prefer current translation)
  const sortedChunks = allChunks
    .sort((a, b) => {
      if (a.absolutePos !== b.absolutePos) {
        return a.absolutePos - b.absolutePos;
      }
      // If same position, prefer current translation
      return a.isCurrent ? -1 : 1;
    })
    .filter((chunk, index, arr) => {
      // Remove overlapping chunks
      if (index === 0) return true;
      const prev = arr[index - 1];
      const prevEnd = prev.absolutePos + prev.chunk.length;
      return chunk.absolutePos >= prevEnd;
    });

  // Build highlighted parts for the entire text
  const buildHighlightedParts = (content: string, startOffset: number = 0): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastPos = 0;
    let globalIndex = 0;

    // Filter chunks that are within this content range
    const relevantChunks = sortedChunks.filter(
      chunk => chunk.absolutePos >= startOffset && chunk.absolutePos < startOffset + content.length
    );

    relevantChunks.forEach((chunkInfo) => {
      const { chunk, chunkIndex, translationIndex, absolutePos, color, translation: chunkTranslation, isCurrent } = chunkInfo;
      const relativePos = absolutePos - startOffset;
      
      // Add text before this chunk
      if (relativePos > lastPos) {
        parts.push(
          <span key={`text-${startOffset}-${globalIndex++}`}>
            {content.slice(lastPos, relativePos)}
          </span>
        );
      }

      // get original text w/ case preserved
      const originalText = content.slice(relativePos, relativePos + chunk.length);

      // Create unique key for this chunk
      const chunkKey = `chunk-${translationIndex}-${chunkIndex}-${startOffset}`;
      const isHovered = hoveredIndex === chunkIndex && isCurrent;
      const isClicked = clickedIndices.has(chunkIndex) && isCurrent;

      // Determine opacity based on whether it's current or previous
      const baseOpacity = isCurrent ? 0.25 : 0.12;

      parts.push(
        <span
          key={chunkKey}
          onMouseUp={() => isCurrent && handleClick(chunkIndex)}
          className={`inline-block px-2 py-0.5 rounded-md font-medium transition-all duration-200 ${isCurrent ? 'cursor-pointer' : 'cursor-default'} ${isClicked ? 'font-sans' : ''}`}
          style={{
            backgroundColor: isHovered
              ? color
              : getColorWithOpacity(color, baseOpacity),
            color: isHovered ? 'white' : 'inherit',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: isCurrent ? 1 : 0.6,
          }}
          onMouseEnter={() => isCurrent && handleHover(chunkIndex)}
          onMouseLeave={() => isCurrent && handleHover(null)}
        >
          {isClicked ? chunkTranslation : originalText}
        </span>
      );

      lastPos = relativePos + chunk.length;
    });

    // Add remaining text after all chunks
    if (lastPos < content.length) {
      parts.push(
        <span key={`text-${startOffset}-${globalIndex++}`}>
          {content.slice(lastPos)}
        </span>
      );
    }

    return parts;
  };

  // If not rendering paragraphs, just return the highlighted text
  if (!renderParagraphs) {
    return <>{buildHighlightedParts(text, 0)}</>;
  }

  // Split into paragraphs and render each with highlighting
  const paragraphs = text.split('\n\n');
  let currentOffset = 0;

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const parts = buildHighlightedParts(paragraph, currentOffset);
        const offset = currentOffset;
        currentOffset += paragraph.length + 2; // +2 for \n\n

        return (
          <p
            key={`para-${index}`}
            className={index === 0 ? "first-letter:text-6xl first-letter:font-semibold first-letter:text-[var(--color-accent)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none" : ""}
          >
            {parts}
          </p>
        );
      })}
    </>
  );
}
