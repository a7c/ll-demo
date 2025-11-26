import type { ChunkPair, TranslationResponse } from '../routes/api.translate';

export interface LiteralPart {
  type: 'text' | 'word';
  content: string;
  sourceWord?: string; // for 'word' type, the source language word
}

export interface PartialTranslation {
  original: string;
  naturalTranslation: string | null;
  directTranslation: string | null;
  literalParts: LiteralPart[]; // parsed literal translation with tagged structure
  chunkPairs: ChunkPair[];
  isComplete: boolean;
}

export function parseStreamingXml(xml: string, original: string): PartialTranslation {
  const result: PartialTranslation = {
    original,
    naturalTranslation: null,
    directTranslation: null,
    literalParts: [],
    chunkPairs: [],
    isComplete: false,
  };

  // parse idiomatic translation
  const idioMatch = xml.match(/<idio>([\s\S]*?)<\/idio>/);
  if (idioMatch) {
    result.naturalTranslation = idioMatch[1].trim();
  } else {
    // check for partial idio tag (still streaming)
    const partialIdioMatch = xml.match(/<idio>([\s\S]*?)$/);
    if (partialIdioMatch && !xml.includes('</idio>')) {
      result.naturalTranslation = partialIdioMatch[1].trim() || null;
    }
  }

  // parse word pairs
  const wordsSection = xml.match(/<words>([\s\S]*?)<\/words>/);
  if (wordsSection) {
    const wordPairRegex = /<w=([^>]+)>([^<]*)<\/w>/g;
    let match;
    while ((match = wordPairRegex.exec(wordsSection[1])) !== null) {
      result.chunkPairs.push({
        original: match[1],
        translation: match[2],
      });
    }
  } else {
    // check for partial words section
    const partialWordsMatch = xml.match(/<words>([\s\S]*)$/);
    if (partialWordsMatch) {
      const wordPairRegex = /<w=([^>]+)>([^<]*)<\/w>/g;
      let match;
      while ((match = wordPairRegex.exec(partialWordsMatch[1])) !== null) {
        result.chunkPairs.push({
          original: match[1],
          translation: match[2],
        });
      }
      // Check for in-progress word tag
      const partialWordMatch = partialWordsMatch[1].match(/<w=([^>]+)>([^<]*)$/);
      if (partialWordMatch) {
        const partialOriginal = partialWordMatch[1];
        const partialTranslation = partialWordMatch[2];
        const exists = result.chunkPairs.some(p => p.original === partialOriginal);
        if (!exists && partialOriginal) {
          result.chunkPairs.push({
            original: partialOriginal,
            translation: partialTranslation || '...',
          });
        }
      }
    }
  }

  // parse literal with tags
  const literalMatch = xml.match(/<literal>([\s\S]*?)<\/literal>/);
  if (literalMatch) {
    result.directTranslation = literalMatch[1].trim();
    result.literalParts = parseLiteralWithTags(literalMatch[1].trim());
    result.isComplete = true;
  } else {
    // check for partial literal tag
    const partialLiteralMatch = xml.match(/<literal>([\s\S]*?)$/);
    if (partialLiteralMatch && !xml.includes('</literal>')) {
      const content = partialLiteralMatch[1].trim();
      if (content) {
        result.directTranslation = content;
        result.literalParts = parseLiteralWithTags(content);
      }
    }
  }

  return result;
}

function parseLiteralWithTags(literal: string): LiteralPart[] {
  const parts: LiteralPart[] = [];
  const tagRegex = /<w=([^>]+)>([^<]*)<\/w>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(literal)) !== null) {
    if (match.index > lastIndex) {
      const text = literal.slice(lastIndex, match.index);
      if (text) {
        parts.push({ type: 'text', content: text });
      }
    }

    parts.push({
      type: 'word',
      content: match[2],
      sourceWord: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < literal.length) {
    const remaining = literal.slice(lastIndex);
    // check for partial tag at the end
    const partialTag = remaining.match(/<w=([^>]*)>?([^<]*)$/);
    if (partialTag) {
      const textBefore = remaining.slice(0, remaining.indexOf('<'));
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
      if (partialTag[1] && partialTag[2]) {
        parts.push({
          type: 'word',
          content: partialTag[2],
          sourceWord: partialTag[1],
        });
      }
    } else {
      parts.push({ type: 'text', content: remaining });
    }
  }

  return parts;
}

export function partialToFull(partial: PartialTranslation): TranslationResponse | null {
  if (!partial.naturalTranslation || !partial.directTranslation || partial.chunkPairs.length === 0) {
    return null;
  }

  return {
    original: partial.original,
    naturalTranslation: partial.naturalTranslation,
    directTranslation: partial.directTranslation,
    chunkPairs: partial.chunkPairs,
    literalParts: partial.literalParts,
  };
}
