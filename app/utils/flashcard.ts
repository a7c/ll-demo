import type { Flashcard, DraftFlashcard } from '../types/flashcard';
import { CardState } from '../types/flashcard';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new flashcard with initial FSRS parameters
 */
export function createFlashcard(draft: DraftFlashcard): Flashcard {
  const now = Date.now();
  
  return {
    id: uuidv4(),
    targetWord: draft.targetWord,
    translation: draft.translation,
    createdAt: now,
    
    // Initial FSRS parameters for new cards
    due: now, // Due immediately for first review
    stability: 0, // No stability yet
    difficulty: 5, // Default medium difficulty (0-10 scale)
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: CardState.New,
    last_review: 0,
    review_log: []
  };
}
