// FSRS Review Ratings
export enum Rating {
  Again = 1,  // Complete blackout, incorrect response
  Hard = 2,   // Correct response, but required significant effort to recall
  Good = 3,   // Correct response, but took effort to recall
  Easy = 4    // Correct response with effortless recall
}

// FSRS Card State
export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3
}

// Review log entry for FSRS
export interface ReviewLog {
  rating: Rating;
  state: CardState;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: number; // timestamp
}

export interface Flashcard {
  id: string;
  targetWord: string;
  translation: string;
  createdAt: number;
  
  // FSRS scheduling parameters
  due: number;              // Next review timestamp
  stability: number;        // Memory stability (days)
  difficulty: number;       // Card difficulty (0-10)
  elapsed_days: number;     // Days since last review
  scheduled_days: number;   // Days scheduled for this review
  reps: number;            // Number of reviews
  lapses: number;          // Number of times card was forgotten
  state: CardState;        // Current card state
  last_review: number;     // Last review timestamp
  
  // Review history for FSRS algorithm
  review_log: ReviewLog[];
}

export interface DraftFlashcard {
  targetWord: string;
  translation: string;
}
