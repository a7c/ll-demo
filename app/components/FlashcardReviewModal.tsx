import { useState, useEffect } from 'react';
import type { Flashcard } from '../types/flashcard';
import { Rating } from '../types/flashcard';

interface FlashcardReviewModalProps {
  isOpen: boolean;
  flashcards: Flashcard[];
  onClose: () => void;
  onReview: (flashcardId: string, rating: Rating) => void;
}

export function FlashcardReviewModal({ isOpen, flashcards, onClose, onReview }: FlashcardReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setShowAnswer(false);
      setReviewedCount(0);
    }
  }, [isOpen]);

  if (!isOpen || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];
  const progress = ((reviewedCount / flashcards.length) * 100).toFixed(0);

  const handleRating = (rating: Rating) => {
    onReview(currentCard.id, rating);
    setReviewedCount(reviewedCount + 1);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Finished all cards
      onClose();
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleSkip = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 animate-fadeIn">
      <div className="bg-[var(--color-parchment)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-[var(--color-panel)] border-b border-[var(--color-border)] px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-ink)]">Review Flashcards</h2>
                <p className="text-xs text-[var(--color-sepia)]">
                  Card {currentIndex + 1} of {flashcards.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-sepia)] hover:text-[var(--color-accent)] transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-8">
          {/* Question Side */}
          <div className="mb-8">
            <div className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-3">
              Target Word
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md border-2 border-[var(--color-border)] min-h-[120px] flex items-center justify-center">
              <p className="text-3xl font-serif font-semibold text-[var(--color-ink)] text-center">
                {currentCard.targetWord}
              </p>
            </div>
          </div>

          {/* Answer Side */}
          {showAnswer && (
            <div className="mb-8 animate-fadeIn">
              <div className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-3">
                Translation
              </div>
              <div className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-xl p-8 shadow-md min-h-[120px] flex items-center justify-center">
                <p className="text-2xl font-medium text-white text-center">
                  {currentCard.translation}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showAnswer ? (
            <div className="flex gap-3">
              <button
                onClick={handleShowAnswer}
                className="flex-1 px-6 py-4 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
              >
                Show Answer
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-4 border-2 border-[var(--color-border)] text-[var(--color-ink-light)] rounded-xl font-medium hover:bg-[var(--color-parchment)] transition-colors"
              >
                Skip
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider text-center mb-4">
                How well did you know this?
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRating(Rating.Again)}
                  className="px-4 py-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <div className="text-lg mb-1">Again</div>
                  <div className="text-xs opacity-75">&lt;1 min</div>
                </button>
                <button
                  onClick={() => handleRating(Rating.Hard)}
                  className="px-4 py-4 bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-xl font-semibold hover:bg-orange-100 hover:border-orange-300 transition-all"
                >
                  <div className="text-lg mb-1">Hard</div>
                  <div className="text-xs opacity-75">&lt;10 min</div>
                </button>
                <button
                  onClick={() => handleRating(Rating.Good)}
                  className="px-4 py-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl font-semibold hover:bg-green-100 hover:border-green-300 transition-all"
                >
                  <div className="text-lg mb-1">Good</div>
                  <div className="text-xs opacity-75">1 day</div>
                </button>
                <button
                  onClick={() => handleRating(Rating.Easy)}
                  className="px-4 py-4 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 hover:border-blue-300 transition-all"
                >
                  <div className="text-lg mb-1">Easy</div>
                  <div className="text-xs opacity-75">4 days</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-[var(--color-panel)] border-t border-[var(--color-border)] px-6 py-3">
          <div className="flex items-center justify-between text-xs text-[var(--color-sepia)]">
            <div className="flex items-center gap-4">
              <span>Reviews: {currentCard.reps}</span>
              <span>•</span>
              <span>Lapses: {currentCard.lapses}</span>
            </div>
            <div>
              Reviewed: {reviewedCount} / {flashcards.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
