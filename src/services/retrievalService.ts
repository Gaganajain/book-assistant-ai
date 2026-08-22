import { BookChunk, CitationSource, SearchResultItem } from '../types';

/**
 * Computes cosine similarity between two float vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Extracts normalized keyword tokens from text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Computes TF-IDF-like BM25 keyword score for query against chunk text
 */
export function computeKeywordScore(query: string, chunkText: string): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const chunkTokens = tokenize(chunkText);
  if (chunkTokens.length === 0) return 0;

  const chunkSet = new Set(chunkTokens);
  let matches = 0;

  for (const token of queryTokens) {
    if (chunkSet.has(token)) {
      matches += 1;
    }
  }

  // Exact phrase boost
  let phraseBoost = 0;
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length > 5 && chunkText.toLowerCase().includes(cleanQuery)) {
    phraseBoost = 0.5;
  }

  return (matches / queryTokens.length) * 0.7 + phraseBoost;
}

/**
 * Retrieve top K most relevant chunks using hybrid semantic + keyword scoring
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: BookChunk[],
  options: {
    topK?: number;
    queryEmbedding?: number[];
    chapterFilter?: string;
  } = {}
): CitationSource[] {
  const { topK = 5, queryEmbedding, chapterFilter } = options;

  let candidateChunks = chunks;
  if (chapterFilter) {
    candidateChunks = chunks.filter(
      (c) => c.chapterId === chapterFilter || c.chapterTitle.toLowerCase().includes(chapterFilter.toLowerCase())
    );
  }

  if (candidateChunks.length === 0) {
    candidateChunks = chunks;
  }

  const scored = candidateChunks.map((chunk) => {
    let semanticScore = 0;
    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    }

    const keywordScore = computeKeywordScore(query, `${chunk.chapterTitle} ${chunk.sectionTitle || ''} ${chunk.text}`);

    // If query mentions specific chapter number or page number, add strong boost
    let metadataBoost = 0;
    const pageMatch = query.match(/(?:page|p\.?)\s*(\d+)/i);
    if (pageMatch && parseInt(pageMatch[1], 10) === chunk.pageNumber) {
      metadataBoost += 0.8;
    }

    const chapterMatch = query.match(/chapter\s*(\d+)/i);
    if (chapterMatch && chunk.chapterTitle.toLowerCase().includes(`chapter ${chapterMatch[1]}`)) {
      metadataBoost += 0.5;
    }

    // Hybrid score
    const combinedScore = queryEmbedding
      ? semanticScore * 0.55 + keywordScore * 0.35 + metadataBoost * 0.1
      : keywordScore * 0.75 + metadataBoost * 0.25;

    return {
      chunkId: chunk.id,
      chapter: chunk.chapterTitle,
      page: chunk.pageNumber,
      excerpt: chunk.text,
      relevanceScore: combinedScore,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return scored.slice(0, topK);
}

/**
 * Search all chunks for full-text explorer
 */
export function searchBookChunks(query: string, chunks: BookChunk[]): SearchResultItem[] {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.toLowerCase().trim();

  const results: SearchResultItem[] = [];

  for (const chunk of chunks) {
    const textLower = chunk.text.toLowerCase();
    const chapterLower = chunk.chapterTitle.toLowerCase();

    let score = computeKeywordScore(query, `${chunk.chapterTitle} ${chunk.text}`);
    if (textLower.includes(cleanQuery)) {
      score += 0.6;
    }
    if (chapterLower.includes(cleanQuery)) {
      score += 0.4;
    }

    if (score > 0.15) {
      // Find a snippet around the match
      let snippet = chunk.text;
      const matchIdx = textLower.indexOf(cleanQuery);
      if (matchIdx !== -1) {
        const start = Math.max(0, matchIdx - 60);
        const end = Math.min(chunk.text.length, matchIdx + cleanQuery.length + 80);
        snippet = (start > 0 ? '...' : '') + chunk.text.slice(start, end) + (end < chunk.text.length ? '...' : '');
      } else {
        snippet = chunk.text.slice(0, 140) + '...';
      }

      results.push({
        chunkId: chunk.id,
        text: chunk.text,
        chapter: chunk.chapterTitle,
        page: chunk.pageNumber,
        score,
        snippet,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
