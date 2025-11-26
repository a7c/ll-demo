import type { TranslationResponse } from '../routes/api.translate';
import { generateChunkColors, getColorWithOpacity } from '../utils/colors';

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
  const colors = generateChunkColors(translation.chunkPairs.length);
  const translationChunks = translation.chunkPairs.map(pair => pair.translation);
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
      <div className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-xl p-5 shadow-md mb-4 text-white">
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
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
    </div>
  );
}
