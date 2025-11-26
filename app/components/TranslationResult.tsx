import type { TranslationResponse } from '../routes/api.translate';

interface TranslationResultProps {
  translation: TranslationResponse;
  onClose: () => void;
}

export function TranslationResult({ translation, onClose }: TranslationResultProps) {
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

      {/* Original Text */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4">
        <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-2">
          Original
        </h4>
        <p className="font-serif text-lg text-[var(--color-ink)] leading-relaxed">
          {translation.original}
        </p>
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
          {translation.directTranslation}
        </p>
      </div>

      {/* Chunk Pairs */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
        <h4 className="text-xs font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Word-by-Word Breakdown
        </h4>
        <div className="space-y-2">
          {translation.chunkPairs.map((pair, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-[var(--color-parchment)] rounded-lg hover:bg-[var(--color-amber-light)] hover:bg-opacity-20 transition-colors"
            >
              <div className="flex-1">
                <div className="font-serif text-base text-[var(--color-ink)] font-medium">
                  {pair.original}
                </div>
              </div>
              <div className="text-[var(--color-sepia)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-[var(--color-ink-light)]">
                  {pair.translation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
