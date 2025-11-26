export interface Flashcard {
  id: string;
  targetWord: string;
  translation: string;
  createdAt: number;
}

export interface DraftFlashcard {
  targetWord: string;
  translation: string;
}
