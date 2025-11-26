import { useState } from 'react';

interface DropZoneProps {
  onDrop: (targetWord: string, translation: string) => void;
}

export function DropZone({ onDrop }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.targetWord && data.translation) {
        onDrop(data.targetWord, data.translation);
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
        ${isDragOver 
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10 scale-105' 
          : 'border-[var(--color-border)] bg-[var(--color-parchment)]'
        }
      `}
    >
      <div className={`transition-colors duration-200 ${isDragOver ? 'text-[var(--color-accent)]' : 'text-[var(--color-sepia)]'}`}>
        <svg 
          className={`w-12 h-12 mx-auto mb-3 transition-transform duration-200 ${isDragOver ? 'scale-110' : ''}`}
          fill="none" 
          stroke={isDragOver ? 'white' : 'currentColor'} 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className={`text-sm font-medium mb-1 ${isDragOver ? 'text-white' : ''}`}>
          {isDragOver ? 'Drop to create flashcard' : 'Drag a word here'}
        </p>
        <p className={`text-xs opacity-75 ${isDragOver ? 'text-white' : ''}`}>
          {isDragOver ? 'Release to add' : 'Save words to learn later'}
        </p>
      </div>
    </div>
  );
}
