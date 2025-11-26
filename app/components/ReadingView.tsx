import { useState, useRef, useEffect } from 'react';
import { TranslationResult } from './TranslationResult';
import { HighlightedText } from './HighlightedText';
import { TextUploadModal } from './TextUploadModal';
import { FlashcardList } from './FlashcardList';
import { FlashcardReviewModal } from './FlashcardReviewModal';
import type { TranslationResponse } from '../routes/api.translate';
import type { Flashcard, DraftFlashcard } from '../types/flashcard';
import { Rating } from '../types/flashcard';
import { createFlashcard } from '../utils/flashcard';
import { parseStreamingXml, type PartialTranslation } from '../utils/xmlParser';

interface TooltipPosition {
  x: number;
  y: number;
}

interface CustomText {
  title: string;
  language: string;
  content: string;
}

const DEFAULT_TEXT: CustomText = {
  title: "Le Petit Prince",
  language: "French",
  content: `Lorsque j'avais six ans j'ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge qui s'appelait "Histoires Vécues". Ça représentait un serpent boa qui avalait un fauve. Voilà la copie du dessin.

On disait dans le livre: "Les serpents boas avalent leur proie tout entière, sans la mâcher. Ensuite ils ne peuvent plus bouger et ils dorment pendant les six mois de leur digestion."

J'ai alors beaucoup réfléchi sur les aventures de la jungle et, à mon tour, j'ai réussi, avec un crayon de couleur, à tracer mon premier dessin. Mon dessin numéro 1. Il était comme ça:

J'ai montré mon chef d'œuvre aux grandes personnes et je leur ai demandé si mon dessin leur faisait peur.

Elles m'ont répondu: "Pourquoi un chapeau ferait-il peur?"

Mon dessin ne représentait pas un chapeau. Il représentait un serpent boa qui digérait un éléphant. J'ai alors dessiné l'intérieur du serpent boa, afin que les grandes personnes puissent comprendre. Elles ont toujours besoin d'explications.

Les grandes personnes m'ont conseillé de laisser de côté les dessins de serpents boas ouverts ou fermés, et de m'intéresser plutôt à la géographie, à l'histoire, au calcul et à la grammaire. C'est ainsi que j'ai abandonné, à l'âge de six ans, une magnifique carrière de peintre.

J'avais été découragé par l'insuccès de mon dessin numéro 1 et de mon dessin numéro 2. Les grandes personnes ne comprennent jamais rien toutes seules, et c'est fatigant, pour les enfants, de toujours et toujours leur donner des explications.`
};

export function ReadingView() {
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [translation, setTranslation] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [customText, setCustomText] = useState<CustomText>(DEFAULT_TEXT);
  const [savedFlashcards, setSavedFlashcards] = useState<Flashcard[]>([]);
  const [partialTranslation, setPartialTranslation] = useState<PartialTranslation | null>(null);
  const [previousTranslations, setPreviousTranslations] = useState<TranslationResponse[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const readingPanelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0 && readingPanelRef.current) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setSelectedText(text);
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
        }
      } else {
        setSelectedText('');
        setTooltipPosition(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      
      // Constrain between 280px and 600px
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleTranslate = async () => {
    if (!selectedText || isTranslating) return;

    saveTranslation();
    setIsTranslating(true);
    setTooltipPosition(null);
    setTranslation(null);
    setPartialTranslation(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const parsed = parseStreamingXml(accumulated, selectedText);
        setPartialTranslation(parsed);

        if (parsed.isComplete) {
          const translationData = {
            original: parsed.original,
            naturalTranslation: parsed.naturalTranslation || '',
            directTranslation: parsed.directTranslation || '',
            chunkPairs: parsed.chunkPairs,
            literalParts: parsed.literalParts,
          };
          setTranslation(translationData);
          
          // Auto-generate flashcards from chunk pairs
          const newFlashcards = parsed.chunkPairs.map(pair => 
            createFlashcard({
              targetWord: pair.original,
              translation: pair.translation
            })
          );
          
          // Filter out duplicates based on targetWord (case-insensitive)
          const existingWords = new Set(
            savedFlashcards.map(f => f.targetWord.toLowerCase())
          );
          const uniqueNewFlashcards = newFlashcards.filter(
            f => !existingWords.has(f.targetWord.toLowerCase())
          );
          
          if (uniqueNewFlashcards.length > 0) {
            setSavedFlashcards([...savedFlashcards, ...uniqueNewFlashcards]);
          }
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const saveTranslation = () => {
    if (translation) {
      setPreviousTranslations(prev => [translation, ...prev].slice(0, 10)); // Keep last 10 translations
    }
  };

  const handleCloseTranslation = () => {
    saveTranslation();
    setTranslation(null);
  };

  const handleUploadText = (text: string, title: string, language: string) => {
    setCustomText({ title, language, content: text });
    setTranslation(null); // Clear any existing translation
    setIsUploadModalOpen(false);
  };

  const handleSaveFlashcard = (flashcard: DraftFlashcard) => {
    const newFlashcard = createFlashcard(flashcard);
    setSavedFlashcards([...savedFlashcards, newFlashcard]);
  };

  const handleDeleteFlashcard = (id: string) => {
    setSavedFlashcards(savedFlashcards.filter(f => f.id !== id));
  };

  const handleUpdateFlashcard = (id: string, draft: DraftFlashcard) => {
    setSavedFlashcards(savedFlashcards.map(card => 
      card.id === id 
        ? { ...card, targetWord: draft.targetWord, translation: draft.translation }
        : card
    ));
  };

  const handleStartReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleReview = (flashcardId: string, rating: Rating) => {
    // TODO: Implement FSRS algorithm to update card parameters
    // For now, just update basic stats
    setSavedFlashcards(savedFlashcards.map(card => {
      if (card.id === flashcardId) {
        const now = Date.now();
        return {
          ...card,
          reps: card.reps + 1,
          lapses: rating === Rating.Again ? card.lapses + 1 : card.lapses,
          last_review: now,
          // Placeholder scheduling - will be replaced with FSRS
          due: now + (rating === Rating.Again ? 60000 : rating === Rating.Hard ? 600000 : rating === Rating.Good ? 86400000 : 345600000)
        };
      }
      return card;
    }));
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-panel)] px-8 py-4 flex items-center justify-between animate-slideDown">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-semibold">語</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-ink)]">LinguaScaffold</h1>
            <p className="text-xs text-[var(--color-sepia)]">Contextual Language Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg cursor-pointer hover:bg-[var(--color-accent-dark)] transition-all shadow-sm hover:shadow-md">
            Upload new text
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Translation Tooltip */}
        {tooltipPosition && selectedText && (
          <div
            className="fixed z-50 animate-tooltipIn"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-[var(--color-ink)] text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2">
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2 hover:text-[var(--color-amber-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTranslating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">Translating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-sm font-medium">Translate</span>
                  </>
                )}
              </button>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--color-ink)]" />
          </div>
        )}

        {/* Main Reading Panel */}
        <main 
          ref={readingPanelRef}
          className="flex-1 overflow-y-auto px-12 py-10 animate-fadeIn"
          style={{ 
            marginRight: `${sidebarWidth}px`,
            transition: isResizing ? 'none' : 'margin-right 0.2s ease'
          }}
        >
          <article className="max-w-3xl mx-auto">
            <div className="mb-8 pb-6 border-b border-[var(--color-border)]">
              <h2 className="text-4xl font-serif font-semibold text-[var(--color-ink)] mb-3">
                {customText.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-[var(--color-sepia)]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {customText.language}
                </span>
              </div>
            </div>

            <div className="prose prose-lg font-serif text-[var(--color-ink-light)] leading-relaxed space-y-6">
              {customText.content.split('\n\n').map((paragraph, index) => (
                <p 
                  key={index}
                  className={index === 0 ? "first-letter:text-6xl first-letter:font-semibold first-letter:text-[var(--color-accent)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none" : ""}
                >
                  <HighlightedText
                    text={paragraph}
                    translation={
                      // use partial translation if we're translating
                      isTranslating && partialTranslation
                        ? {
                          original: partialTranslation.original,
                          naturalTranslation: partialTranslation.naturalTranslation || '',
                          directTranslation: partialTranslation.directTranslation || '',
                          chunkPairs: partialTranslation.chunkPairs,
                          literalParts: partialTranslation.literalParts,
                        }
                        : translation
                    }
                    previousTranslations={previousTranslations}
                    onHoverChange={setHoveredIndex}
                  />
                </p>
              ))}
            </div>
          </article>
        </main>

        {/* Resizable Sidebar */}
        <aside 
          className="fixed right-0 top-[73px] bottom-0 bg-[var(--color-panel)] border-l border-[var(--color-border)] flex flex-col shadow-2xl animate-slideLeft"
          style={{ 
            width: `${sidebarWidth}px`,
            transition: isResizing ? 'none' : 'width 0.2s ease'
          }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--color-accent)] transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-[var(--color-border)] rounded-full group-hover:bg-[var(--color-accent)] transition-colors" />
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isTranslating && partialTranslation ? (
              <TranslationResult
                translation={null}
                partialTranslation={partialTranslation}
                onClose={handleCloseTranslation}
                hoveredIndex={hoveredIndex}
                savedFlashcards={savedFlashcards}
                onSaveFlashcard={handleSaveFlashcard}
                onDeleteFlashcard={handleDeleteFlashcard}
                onUpdateFlashcard={handleUpdateFlashcard}
                isStreaming={true}
              />
            ) : translation ? (
              <TranslationResult
                translation={translation}
                partialTranslation={null}
                onClose={handleCloseTranslation}
                hoveredIndex={hoveredIndex}
                savedFlashcards={savedFlashcards}
                onSaveFlashcard={handleSaveFlashcard}
                onDeleteFlashcard={handleDeleteFlashcard}
                onUpdateFlashcard={handleUpdateFlashcard}
                isStreaming={false}
              />
            ) : isTranslating ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                    <div className="text-[var(--color-sepia)]">
                      <svg className="w-16 h-16 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm font-medium">Translating...</span>
                </div>
                  </div>
            ) : savedFlashcards.length > 0 ? (
              <FlashcardList 
                flashcards={savedFlashcards}
                type="all"
                onDelete={handleDeleteFlashcard}
                onUpdate={handleUpdateFlashcard}
                onStartReview={handleStartReview}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center px-4">
                <div className="text-[var(--color-sepia)]">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <p className="text-sm font-medium mb-2">Select text to translate</p>
                  <p className="text-xs opacity-75">Highlight any word, sentence, or passage in the reading panel and click the Translate button!</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Text Upload Modal */}
      <TextUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadText}
      />

      {/* Flashcard Review Modal */}
      <FlashcardReviewModal
        isOpen={isReviewModalOpen}
        flashcards={savedFlashcards}
        onClose={() => setIsReviewModalOpen(false)}
        onReview={handleReview}
      />
    </div>
  );
}
