import { BookChunk, BookOverviewData, ChapterSummaryData, CitationSource, KeyTakeawayItem } from '../types';

export interface RAGQueryResponse {
  answer: string;
  sources: CitationSource[];
  suggestedFollowUps?: string[];
  isInsufficientEvidence?: boolean;
  error?: string;
}

export async function checkServerHealth(): Promise<{ hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { hasApiKey: false, model: 'gemini-3.7-flash' };
  }
}

export async function queryRAGAssistant(params: {
  query: string;
  bookTitle: string;
  bookAuthor?: string;
  chunks: CitationSource[];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<RAGQueryResponse> {
  try {
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error('Error querying RAG assistant:', error);
    // Fallback response with grounded local context
    const topChunk = params.chunks[0];
    if (topChunk) {
      return {
        answer: `According to **${topChunk.chapter}** (PDF page ${topChunk.page}):\n\n> "${topChunk.excerpt}"\n\n*(Connect your Gemini API key in AI Studio Secrets to unlock dynamic semantic reasoning.)*`,
        sources: params.chunks.slice(0, 3),
        suggestedFollowUps: [
          `Tell me more about ${topChunk.chapter}`,
          'What are the key takeaways?',
          'What examples does the author give?'
        ],
        isInsufficientEvidence: false,
      };
    }

    return {
      answer: "I couldn't find enough information about this in the uploaded book.\n\nTry asking about specific chapters, concepts, or examples from the book.",
      sources: [],
      suggestedFollowUps: [
        'What is the main theme of the book?',
        'Explain Chapter 1 in simple terms.'
      ],
      isInsufficientEvidence: true,
    };
  }
}

export async function generateChapterSummary(params: {
  chapterTitle: string;
  chapterNumber: number;
  startPage: number;
  endPage: number;
  chapterChunks: BookChunk[];
  bookTitle: string;
}): Promise<ChapterSummaryData | null> {
  try {
    const res = await fetch('/api/rag/chapter-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate summary');
    return await res.json();
  } catch (err) {
    console.warn('Chapter summary generation fallback:', err);
    return null;
  }
}

export async function generateBookOverview(params: {
  bookTitle: string;
  bookAuthor?: string;
  chapterTitles: string[];
  sampleChunks: BookChunk[];
}): Promise<BookOverviewData | null> {
  try {
    const res = await fetch('/api/rag/book-overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate overview');
    return await res.json();
  } catch (err) {
    console.warn('Overview generation fallback:', err);
    return null;
  }
}

export async function generateTopTakeaways(params: {
  bookTitle: string;
  sampleChunks: BookChunk[];
}): Promise<KeyTakeawayItem[] | null> {
  try {
    const res = await fetch('/api/rag/takeaways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Failed to generate takeaways');
    return await res.json();
  } catch (err) {
    console.warn('Takeaways generation fallback:', err);
    return null;
  }
}
