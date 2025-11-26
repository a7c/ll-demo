import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChunkPair {
  original: string;
  translation: string;
}

export interface LiteralPart {
  type: 'text' | 'word';
  content: string;
  sourceWord?: string;
}

export interface TranslationResponse {
  original: string;
  naturalTranslation: string;
  directTranslation: string;
  chunkPairs: ChunkPair[];
  literalParts: LiteralPart[];
}

export async function action({ request }: { request: Request }) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a language learning assistant. Translate the following text into English using XML format.

Text to translate: "${text}"

Respond with ONLY this XML structure (no other text):

<idio>Natural, idiomatic English translation that reads smoothly</idio>
<words>
<w=word1_in_source>word1_in_english</w>
<w=word2_in_source>word2_in_english</w>
...more word pairs...
</words>
<literal>Tagged literal translation with each word wrapped in its source tag</literal>

Rules:
- <idio>: A natural, fluent English translation
- <words>: Map each meaningful lexical item (word/phrase) from source to English. Focus on content words. The source word goes in the = attribute, the English translation goes inside the tag.
- <literal>: A direct translation where EACH translated word/phrase is wrapped with <w=source>word</w> tags matching the words section. Non-content words (articles, prepositions) stay untagged.

Example for "今日のおやつどうしようか。":
<idio>What snack do you want today?</idio>
<words>
<w=今日>today</w>
<w=おやつ>snack</w>
<w=どうしよう>what to do</w>
</words>
<literal><w=どうしよう>What to do</w> for <w=今日>today</w>'s <w=おやつ>snack</w>?</literal>

Output ONLY the XML, nothing else.`
        }
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
