import { useState } from 'react';
import type { TranslationResponse } from '../routes/api.translate';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';

interface HighlightedTextProps {
  text: string;
  translation: TranslationResponse | null;
  onHoverChange?: (index: number | null) => void;
}

function indexOfIgnoreCase(text: string, search: string): number {
  return text.toLowerCase().indexOf(search.toLowerCase());
}

export function HighlightedText({ text, translation, onHoverChange }: HighlightedTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    onHoverChange?.(index);
  };

  // If no translation, render plain text
  if (!translation) {
    return <>{text}</>;
  }

  // find original text position
  const translationStartPos = indexOfIgnoreCase(text, translation.original);
  if (translationStartPos === -1) {
    // This paragraph doesn't contain the translated text
    return <>{text}</>;
  }

  const colors = generateChunkColors(translation.chunkPairs.length);
  const chunks = translation.chunkPairs.map(pair => pair.original);

  // sort chunks by their position in original text
  const sortedChunks = chunks
    .map((chunk, index) => {
      const pos = indexOfIgnoreCase(translation.original, chunk);
      return {
        chunk,
        index,
        pos,
        absolutePos: pos !== -1 ? translationStartPos + pos : -1
      };
    })
    .filter(item => item.pos !== -1)
    .sort((a, b) => a.absolutePos - b.absolutePos);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let globalIndex = 0;

  // Add text before the translated section
  if (translationStartPos > 0) {
    parts.push(
      <span key={`text-${globalIndex++}`}>
        {text.slice(0, translationStartPos)}
      </span>
    );
  }

  // Render the translated section with pills
  const translationEndPos = translationStartPos + translation.original.length;
  let lastPosInTranslation = translationStartPos;

  sortedChunks.forEach(({ chunk, index, absolutePos }) => {
    // Add text before this chunk (within the translated section)
    if (absolutePos > lastPosInTranslation) {
      parts.push(
        <span key={`text-${globalIndex++}`}>
          {text.slice(lastPosInTranslation, absolutePos)}
        </span>
      );
    }

    // get original text w/ case preserved
    const originalText = text.slice(absolutePos, absolutePos + chunk.length);

    // Add the highlighted chunk as a draggable pill
    const isHovered = hoveredIndex === index;
    const chunkTranslation = translation.chunkPairs[index].translation;

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/json', JSON.stringify({
        targetWord: originalText,
        translation: chunkTranslation
      }));
    };

    parts.push(
      <span
        key={`chunk-${index}`}
        draggable
        onDragStart={handleDragStart}
        className="inline-block px-2 py-0.5 rounded-md font-medium transition-all duration-200 cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: isHovered
            ? colors[index]
            : getColorWithOpacity(colors[index], 0.25),
          color: isHovered ? 'white' : 'inherit',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
        onMouseEnter={() => handleHover(index)}
        onMouseLeave={() => handleHover(null)}
      >
        {originalText}
      </span>
    );

    lastPosInTranslation = absolutePos + chunk.length;
  });

  // Add remaining text within the translated section
  if (lastPosInTranslation < translationEndPos) {
    parts.push(
      <span key={`text-${globalIndex++}`}>
        {text.slice(lastPosInTranslation, translationEndPos)}
      </span>
    );
  }

  // Add text after the translated section
  if (translationEndPos < text.length) {
    parts.push(
      <span key={`text-${globalIndex++}`}>
        {text.slice(translationEndPos)}
      </span>
    );
  }

  return <>{parts}</>;
}
