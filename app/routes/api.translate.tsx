import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChunkPair {
  original: string;
  translation: string;
}

export interface TranslationResponse {
  original: string;
  naturalTranslation: string;
  directTranslation: string;
  chunkPairs: ChunkPair[];
}

const translationSchema = {
  type: "object" as const,
  properties: {
    original: {
      type: "string" as const,
      description: "The original text that was provided for translation"
    },
    naturalTranslation: {
      type: "string" as const,
      description: "A natural, idiomatic translation into English that prioritizes readability and fluency"
    },
    directTranslation: {
      type: "string" as const,
      description: "A direct, literal translation into English that preserves the structure and word order of the original text as much as possible"
    },
    chunkPairs: {
      type: "array" as const,
      description: "A list of paired lexical items from the original text and their corresponding items in the direct translation",
      items: {
        type: "object" as const,
        properties: {
          original: {
            type: "string" as const,
            description: "A lexical item (word or phrase) from the original text"
          },
          translation: {
            type: "string" as const,
            description: "The corresponding lexical item from the direct translation"
          }
        },
        required: ["original" as const, "translation" as const]
      }
    }
  },
  required: ["original" as const, "naturalTranslation" as const, "directTranslation" as const, "chunkPairs" as const]
};

export async function action({ request }: { request: Request }) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }


    // TODO: Provide more context for the translation.
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a language learning assistant. Translate the following text into English and provide structured analysis.

Text to translate: "${text}"

Please provide:
1. The original text (echo it back)
2. A natural, idiomatic English translation that reads smoothly and naturally
3. A direct, literal translation that preserves the original structure and as much as possible, but word order should match English syntax.
4. A list of chunk pairs that map each meaningful lexical item (word or phrase) from the original to its corresponding item in the direct translation. Focus on content words and phrases and skip function words. Only include function words when they are absolutely necessary for the chunk to match the corresponding chunk.

Example format:
- Original: 今日のおやつどうしようか。
- Natural translation: What snack do you want today?
- Direct translation: What to do for today's snack?
- Chunk pairs: [(今日, today), (おやつ, snack), (どうしよう, what to do)]

Verify that each item in the chunk pairs corresponds exactly to text in the original and the direct translation.

Return your response as a JSON object matching the provided schema.`
        }
      ],
      tools: [
        {
          name: 'provide_translation',
          description: 'Provide a structured translation with natural translation, direct translation, and chunk pairs',
          input_schema: translationSchema
        }
      ],
      tool_choice: { type: 'tool', name: 'provide_translation' }
    });

    // Extract the tool use result
    const toolUse = message.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUse) {
      return Response.json(
        { error: 'No translation generated' },
        { status: 500 }
      );
    }

    const translationData = toolUse.input as TranslationResponse;

    return Response.json(translationData);
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
