import { useState, useRef, useEffect } from 'react';

interface TextUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (text: string, title: string, language: string) => void;
}

export function TextUploadModal({ isOpen, onClose, onUpload }: TextUploadModalProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('French');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (text.trim() && title.trim()) {
      onUpload(text.trim(), title.trim(), language);
      setText('');
      setTitle('');
      setLanguage('French');
    }
  };

  const handleCancel = () => {
    setText('');
    setTitle('');
    setLanguage('French');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-[var(--color-parchment)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-[var(--color-panel)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">Upload Text</h2>
              <p className="text-xs text-[var(--color-sepia)]">Paste your text to start learning</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-[var(--color-sepia)] hover:text-[var(--color-accent)] transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg text-base text-[var(--color-ink)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                placeholder="e.g., Le Petit Prince - Chapter 1"
              />
            </div>

            {/* Language Select */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg text-base text-[var(--color-ink)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              >
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Korean">Korean</option>
                <option value="Russian">Russian</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
                Text Content
              </label>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-base text-[var(--color-ink-light)] font-serif leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none"
                placeholder="Paste your text here..."
                rows={12}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-sepia)]">
                <span>{text.length} characters</span>
                <span>{text.trim().split(/\s+/).filter(w => w.length > 0).length} words</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-panel)] border-t border-[var(--color-border)] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2 border border-[var(--color-border)] text-[var(--color-ink-light)] rounded-lg font-medium hover:bg-[var(--color-parchment)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || !title.trim()}
            className="px-5 py-2 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Text
          </button>
        </div>
      </div>
    </div>
  );
}
