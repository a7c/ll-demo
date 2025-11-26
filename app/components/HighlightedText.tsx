import { useState } from 'react';
import type { TranslationResponse } from '../routes/api.translate';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';

interface HighlightedTextProps {
  text: string;
  translation: TranslationResponse | null;
  onHoverChange?: (index: number | null) => void;
}

export function HighlightedText({ text, translation, onHoverChange }: HighlightedTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    onHoverChange?.(index);
  };

  // If no translation or the text doesn't match the original, render plain text
  if (!translation || translation.original !== text) {
    return <>{text}</>;
  }

  const colors = generateChunkColors(translation.chunkPairs.length);
  const chunks = translation.chunkPairs.map(pair => pair.original);

  // Sort chunks by their position in the text
  const sortedChunks = chunks
    .map((chunk, index) => ({ chunk, index, pos: text.indexOf(chunk) }))
    .filter(item => item.pos !== -1)
    .sort((a, b) => a.pos - b.pos);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let globalIndex = 0;

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
        className="inline-block px-2 py-0.5 rounded-md font-medium transition-all duration-200 cursor-pointer"
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
