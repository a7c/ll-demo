import { useState, useRef, useEffect } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

export function ReadingView() {
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
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

  const handleTranslate = () => {
    console.log('Translating:', selectedText);
    // Translation logic will be implemented later
    // For now, just log the selected text
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
          <button className="px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-accent)] transition-colors">
            Upload Text
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-dark)] transition-all shadow-sm hover:shadow-md">
            Settings
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
                className="flex items-center gap-2 hover:text-[var(--color-amber-light)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-sm font-medium">Translate</span>
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
                Le Petit Prince
              </h2>
              <div className="flex items-center gap-4 text-sm text-[var(--color-sepia)]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Antoine de Saint-Exupéry
                </span>
                <span>•</span>
                <span>French • Intermediate</span>
                <span>•</span>
                <span>Chapter 1</span>
              </div>
            </div>

            <div className="prose prose-lg font-serif text-[var(--color-ink-light)] leading-relaxed space-y-6">
              <p className="first-letter:text-6xl first-letter:font-semibold first-letter:text-[var(--color-accent)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                Lorsque j'avais six ans j'ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge qui s'appelait "Histoires Vécues". Ça représentait un serpent boa qui avalait un fauve. Voilà la copie du dessin.
              </p>

              <p>
                On disait dans le livre: "Les serpents boas avalent leur proie tout entière, sans la mâcher. Ensuite ils ne peuvent plus bouger et ils dorment pendant les six mois de leur digestion."
              </p>

              <p>
                J'ai alors beaucoup réfléchi sur les aventures de la jungle et, à mon tour, j'ai réussi, avec un crayon de couleur, à tracer mon premier dessin. Mon dessin numéro 1. Il était comme ça:
              </p>

              <p>
                J'ai montré mon chef d'œuvre aux grandes personnes et je leur ai demandé si mon dessin leur faisait peur.
              </p>

              <p>
                Elles m'ont répondu: "Pourquoi un chapeau ferait-il peur?"
              </p>

              <p>
                Mon dessin ne représentait pas un chapeau. Il représentait un serpent boa qui digérait un éléphant. J'ai alors dessiné l'intérieur du serpent boa, afin que les grandes personnes puissent comprendre. Elles ont toujours besoin d'explications.
              </p>

              <p>
                Les grandes personnes m'ont conseillé de laisser de côté les dessins de serpents boas ouverts ou fermés, et de m'intéresser plutôt à la géographie, à l'histoire, au calcul et à la grammaire. C'est ainsi que j'ai abandonné, à l'âge de six ans, une magnifique carrière de peintre.
              </p>

              <p>
                J'avais été découragé par l'insuccès de mon dessin numéro 1 et de mon dessin numéro 2. Les grandes personnes ne comprennent jamais rien toutes seules, et c'est fatigant, pour les enfants, de toujours et toujours leur donner des explications.
              </p>
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
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-sepia)] uppercase tracking-wider mb-4">
                Learning Tools
              </h3>
              
              {/* Vocabulary Section */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Vocabulary
                </h4>
                <div className="space-y-3">
                  <div className="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="font-serif text-lg text-[var(--color-ink)] mb-1">magnifique</div>
                    <div className="text-sm text-[var(--color-sepia)] italic mb-1">adjective</div>
                    <div className="text-sm text-[var(--color-ink-light)]">magnificent, wonderful</div>
                  </div>
                  <div className="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="font-serif text-lg text-[var(--color-ink)] mb-1">avaler</div>
                    <div className="text-sm text-[var(--color-sepia)] italic mb-1">verb</div>
                    <div className="text-sm text-[var(--color-ink-light)]">to swallow</div>
                  </div>
                  <div className="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="font-serif text-lg text-[var(--color-ink)] mb-1">réfléchi</div>
                    <div className="text-sm text-[var(--color-sepia)] italic mb-1">verb (past participle)</div>
                    <div className="text-sm text-[var(--color-ink-light)]">thought about, reflected</div>
                  </div>
                </div>
              </div>

              {/* Grammar Notes */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] mb-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Grammar Notes
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-[var(--color-parchment)] rounded-lg p-3">
                    <div className="font-medium text-[var(--color-ink)] mb-1">Imparfait Tense</div>
                    <div className="text-[var(--color-ink-light)]">
                      "Lorsque j'avais six ans" - Uses imparfait to describe a past state or habitual action
                    </div>
                  </div>
                  <div className="bg-[var(--color-parchment)] rounded-lg p-3">
                    <div className="font-medium text-[var(--color-ink)] mb-1">Passé Composé</div>
                    <div className="text-[var(--color-ink-light)]">
                      "j'ai vu" - Completed action in the past
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-[var(--color-ink)] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reading Progress
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--color-ink-light)]">Chapter Progress</span>
                      <span className="font-medium text-[var(--color-accent)]">35%</span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-full transition-all duration-500" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 bg-[var(--color-parchment)] rounded-lg">
                      <div className="text-2xl font-semibold text-[var(--color-accent)]">24</div>
                      <div className="text-xs text-[var(--color-sepia)]">Words Learned</div>
                    </div>
                    <div className="text-center p-3 bg-[var(--color-parchment)] rounded-lg">
                      <div className="text-2xl font-semibold text-[var(--color-accent)]">12</div>
                      <div className="text-xs text-[var(--color-sepia)]">Minutes Read</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
