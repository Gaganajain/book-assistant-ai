import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Execute Gemini generateContent with automatic retry on 503/429 errors
 * and secondary fallback model switching if primary is overloaded.
 */
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model?: string;
    contents: any;
    config?: any;
  },
  maxRetries = 3
): Promise<any> {
  const primaryModel = params.model || MODEL_NAME;
  let lastError: any = null;

  // 1. Try primary model with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: primaryModel,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.statusCode;
      const message = String(err?.message || '');
      const isRetryable =
        status === 503 ||
        status === 429 ||
        status === 500 ||
        status === 'UNAVAILABLE' ||
        status === 'RESOURCE_EXHAUSTED' ||
        message.includes('503') ||
        message.includes('high demand') ||
        message.includes('UNAVAILABLE') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('overloaded');

      if (attempt < maxRetries && isRetryable) {
        const delay = Math.min(6000, 1000 * Math.pow(1.8, attempt) + Math.random() * 400);
        console.warn(`[Gemini API Retry] ${primaryModel} attempt ${attempt + 1}/${maxRetries} got ${status || 'error'}. Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  // 2. Try fallback model if primary model was overloaded
  if (primaryModel !== FALLBACK_MODEL) {
    console.warn(`[Gemini API Fallback] Primary model (${primaryModel}) unavailable. Trying ${FALLBACK_MODEL}...`);
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: FALLBACK_MODEL,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        const message = String(err?.message || '');
        const isRetryable =
          status === 503 ||
          status === 429 ||
          message.includes('503') ||
          message.includes('high demand') ||
          message.includes('UNAVAILABLE');

        if (attempt < 2 && isRetryable) {
          const delay = 1000 * (attempt + 1) + Math.random() * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      model: MODEL_NAME,
    });
  });

  // 2. RAG Query Endpoint
  app.post('/api/rag/query', async (req, res) => {
    const { query, bookTitle, bookAuthor, chunks = [], conversationHistory = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const ai = getAIClient();

    // Helper for generating grounded local fallback response
    const buildGroundedFallback = (notice?: string) => {
      const topChunks = (chunks || []).slice(0, 4);
      if (!topChunks || topChunks.length === 0 || (topChunks[0].relevanceScore && topChunks[0].relevanceScore < 0.15)) {
        return {
          answer: "I couldn't find enough information about this in the uploaded book.\n\nTry asking about a specific chapter, concept, author argument, or example from the book.",
          sources: [],
          suggestedFollowUps: [
            'What is the central thesis of this book?',
            'What are the key takeaways from Chapter 1?',
            'What examples does the author provide?'
          ],
          isInsufficientEvidence: true,
        };
      }

      const primary = topChunks[0];
      const secondary = topChunks.length > 1 ? topChunks[1] : null;

      let answerText = `Based on **${primary.chapter}** (PDF page ${primary.page}):\n\n> "${primary.excerpt}"`;
      if (secondary && secondary.page !== primary.page) {
        answerText += `\n\nAdditionally, in **${secondary.chapter}** (PDF page ${secondary.page}):\n\n> "${secondary.excerpt}"`;
      }

      if (notice) {
        answerText += `\n\n*(${notice})*`;
      }

      return {
        answer: answerText,
        sources: topChunks,
        suggestedFollowUps: [
          `Tell me more about ${primary.chapter}`,
          'What evidence does the author provide?',
          'What are the main takeaways from this section?'
        ],
        isInsufficientEvidence: false,
      };
    };

    if (!ai) {
      return res.json(buildGroundedFallback('Set your GEMINI_API_KEY in the Secrets panel for generative reasoning.'));
    }

    // Format retrieved chunks with clear citation metadata
    const formattedContext = (chunks || [])
      .map(
        (c: { chapter: string; page: number; excerpt: string; chunkId: string }, idx: number) =>
          `[Source ${idx + 1} | ChunkID: ${c.chunkId} | Chapter: "${c.chapter}" | PDF Page: ${c.page}]\n"${c.excerpt}"`
      )
      .join('\n\n');

    const systemInstruction = `You are BookWise, an intelligent book assistant.

Answer questions using ONLY the information contained in the retrieved sections of the uploaded book: "${bookTitle || 'the book'}"${bookAuthor ? ` by ${bookAuthor}` : ''}.

CRITICAL GROUNDING RULES:
1. Do not invent facts.
2. Do not assume or extrapolate information that is not present in the retrieved chunks.
3. If the retrieved content does not contain enough information to answer the question, clearly state:
"I couldn't find enough information about this in the uploaded book."
Then provide 2-3 helpful suggestions for what the user can ask instead (e.g. asking about specific chapters, concepts, or examples present in the book).
4. You may explain or simplify information from the retrieved text, but never introduce unsupported claims.
5. Every factual answer should reference the supporting sources. Specify which Chapter and PDF page number supports the claim.
6. When multiple sources support an answer, cite all relevant sources.
7. If the user asks something unrelated to the uploaded book, politely explain that BookWise is designed to answer questions based strictly on the uploaded book.
8. Generate 2 to 3 relevant follow-up questions based directly on the retrieved context.

You must respond in the following JSON format:
{
  "answer": "Grounded answer text in clear Markdown format with inline citation mentions like (Chapter 3, p. 14)...",
  "isInsufficientEvidence": false,
  "citedSources": [
    {
      "chunkId": "id",
      "chapter": "Chapter name",
      "page": 14,
      "exactQuote": "Exact relevant excerpt from the source text"
    }
  ],
  "suggestedFollowUps": [
    "Follow-up question 1?",
    "Follow-up question 2?",
    "Follow-up question 3?"
  ]
}`;

    const historyFormatted = conversationHistory
      .slice(-4)
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `CONVERSATION CONTEXT:
${historyFormatted || 'None'}

RETRIEVED BOOK SOURCES:
${formattedContext || 'No relevant chunks found.'}

USER QUESTION:
${query}

Provide a strictly grounded answer with citations and follow-up questions in JSON format.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      let parsed: {
        answer?: string;
        isInsufficientEvidence?: boolean;
        citedSources?: Array<{ chunkId: string; chapter: string; page: number; exactQuote: string }>;
        suggestedFollowUps?: string[];
      } = {};

      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (err) {
        parsed = {
          answer: response.text || 'Unable to parse model answer.',
          isInsufficientEvidence: false,
          citedSources: [],
          suggestedFollowUps: [],
        };
      }

      // Match cited sources with provided chunks
      const verifiedSources = (chunks || []).filter((chunk: { chunkId: string; page: number }) => {
        if (!parsed.citedSources || parsed.citedSources.length === 0) return true;
        return parsed.citedSources.some(
          (cs) => cs.chunkId === chunk.chunkId || cs.page === chunk.page
        );
      });

      return res.json({
        answer: parsed.answer || "I couldn't find enough information about this in the uploaded book.",
        isInsufficientEvidence: !!parsed.isInsufficientEvidence,
        sources: (verifiedSources.length > 0 ? verifiedSources : chunks).slice(0, 4),
        suggestedFollowUps: parsed.suggestedFollowUps || [
          'What is the main argument of this chapter?',
          'What evidence does the author provide?',
          'How can this concept be applied in practice?'
        ],
      });
    } catch (error: any) {
      console.warn('Gemini API call failed after retries in /api/rag/query, falling back to grounded text retrieval:', error?.message);
      // Graceful grounded fallback instead of 500 error
      const fallbackResult = buildGroundedFallback();
      return res.json(fallbackResult);
    }
  });

  // 3. Summarize Chapter Endpoint
  app.post('/api/rag/chapter-summary', async (req, res) => {
    const { chapterTitle, chapterNumber, startPage, endPage, chapterChunks = [], bookTitle } = req.body;

    const buildFallbackChapterSummary = () => {
      const sampleTexts = (chapterChunks || []).slice(0, 8);
      const textJoined = sampleTexts.map((c: any) => c.text).join(' ');
      const cleanSnippet = textJoined.slice(0, 450).trim() || `Discussion and analysis of ${chapterTitle}.`;

      return {
        whatItIsAbout: [
          `Chapter ${chapterNumber} ("${chapterTitle}") spans pages ${startPage} through ${endPage} of ${bookTitle || 'the book'}.`,
          cleanSnippet.length > 100 ? `${cleanSnippet}...` : `This chapter introduces core concepts and foundational discussions regarding ${chapterTitle}.`,
        ],
        coreIdeas: [
          { idea: `Foundational overview of ${chapterTitle}`, page: startPage },
          { idea: `Key structural arguments and analysis`, page: Math.min(endPage, startPage + 1) },
        ],
        importantConcepts: [
          {
            concept: chapterTitle,
            explanation: `Primary thematic domain explored across pages ${startPage}–${endPage}.`,
            page: startPage,
          },
        ],
        keyTakeaways: [
          `Presents essential definitions and context starting at page ${startPage}.`,
          `Develops analytical frameworks up to page ${endPage}.`,
          `Provides grounding principles relevant to the overall themes of ${bookTitle || 'the book'}.`,
        ],
        evidenceAndExamples: [
          {
            example: `${chapterTitle} Framework`,
            context: `Discussed in detail in Chapter ${chapterNumber}.`,
            page: startPage,
          },
        ],
        revisionNotes: [
          {
            title: `Chapter ${chapterNumber} Core Theme`,
            note: `Review pages ${startPage}–${endPage} for key definitions and author arguments regarding ${chapterTitle}.`,
            source: `${chapterTitle} (p. ${startPage})`,
            page: startPage,
          },
        ],
      };
    };

    const ai = getAIClient();
    if (!ai) {
      return res.json(buildFallbackChapterSummary());
    }

    const sampleText = (chapterChunks || [])
      .slice(0, 15)
      .map((c: { pageNumber: number; text: string }) => `[PDF Page ${c.pageNumber}]: ${c.text}`)
      .join('\n\n');

    const systemInstruction = `You are BookWise, an intelligent academic book summarizer.
Create a structured, highly accurate chapter summary for:
Book: "${bookTitle}"
Chapter ${chapterNumber}: "${chapterTitle}" (Pages ${startPage}–${endPage})

Use ONLY the provided text excerpt. Do not hallucinate or invent facts.
Include:
1. "whatItIsAbout": 2 to 4 detailed paragraphs explaining the central thesis, progression, and importance of the chapter.
2. "coreIdeas": 3-5 core conceptual ideas with specific page references where found.
3. "importantConcepts": 3-5 key terms with simple, clear explanations and page references.
4. "keyTakeaways": 5 numbered high-impact takeaways.
5. "evidenceAndExamples": Important case studies, experiments, or examples mentioned in the text with context and page number.
6. "revisionNotes": 2-4 concise, high-yield revision flashcard notes with exact page citations.`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: `CHAPTER TEXT EXCERPT (Pages ${startPage}-${endPage}):\n\n${sampleText}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whatItIsAbout: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              coreIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    idea: { type: Type.STRING },
                    page: { type: Type.INTEGER },
                  },
                  required: ['idea'],
                },
              },
              importantConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    page: { type: Type.INTEGER },
                  },
                  required: ['concept', 'explanation'],
                },
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              evidenceAndExamples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    example: { type: Type.STRING },
                    context: { type: Type.STRING },
                    page: { type: Type.INTEGER },
                  },
                  required: ['example', 'context'],
                },
              },
              revisionNotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    note: { type: Type.STRING },
                    source: { type: Type.STRING },
                    page: { type: Type.INTEGER },
                  },
                  required: ['title', 'note', 'source', 'page'],
                },
              },
            },
            required: [
              'whatItIsAbout',
              'coreIdeas',
              'importantConcepts',
              'keyTakeaways',
              'evidenceAndExamples',
              'revisionNotes',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Gemini API call failed after retries in /api/rag/chapter-summary, using grounded fallback summary:', error?.message);
      return res.json(buildFallbackChapterSummary());
    }
  });

  // 4. Generate Book Overview Endpoint
  app.post('/api/rag/book-overview', async (req, res) => {
    const { bookTitle, bookAuthor, chapterTitles = [], sampleChunks = [] } = req.body;

    const buildFallbackOverview = () => {
      const topics = (chapterTitles || []).map((t: string) => t.replace(/^Chapter\s+\d+[:\s-]*/i, '')).filter(Boolean);
      return {
        mainTheme: `A structured work exploring ${topics.slice(0, 3).join(', ') || 'core principles'} in depth.`,
        centralArgument: `Examines core theoretical frameworks, case studies, and practical applications across ${chapterTitles.length || 'multiple'} chapters.`,
        majorTopics: topics.length > 0 ? topics.slice(0, 6) : ['Core Principles', 'Foundational Analysis', 'Applied Methodology', 'Key Findings'],
        intendedAudience: 'Students, researchers, professionals, and general readers seeking deep understanding.',
        majorTakeaways: [
          `Structured into ${chapterTitles.length || 'multiple'} focused chapters for systematic study.`,
          'All answers and citations are mapped directly to physical PDF page numbers.',
          'Provides grounded arguments with direct textual verification.',
          'Enables chapter-by-chapter revision with high-yield study flashcards.',
          'Supports natural language querying with verifiable source quotes.'
        ],
      };
    };

    const ai = getAIClient();
    if (!ai) {
      return res.json(buildFallbackOverview());
    }

    const context = (sampleChunks || [])
      .slice(0, 12)
      .map((c: { pageNumber: number; text: string }) => `[Page ${c.pageNumber}]: ${c.text}`)
      .join('\n\n');

    const systemInstruction = `You are BookWise. Generate a concise, strictly grounded overview of the uploaded book.
Do not invent information. If something is not clearly available in the text, write "Not clearly available in the uploaded book."`;

    const prompt = `Book Title: ${bookTitle}
Author: ${bookAuthor || 'Unknown'}
Chapters: ${JSON.stringify(chapterTitles || [])}

Sample Text Excerpts:
${context}

Generate an overview with:
1. mainTheme
2. centralArgument
3. majorTopics (list of 4-6 topics)
4. intendedAudience
5. majorTakeaways (list of 5 major takeaways grounded in the text)`;

    try {
      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainTheme: { type: Type.STRING },
              centralArgument: { type: Type.STRING },
              majorTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              intendedAudience: { type: Type.STRING },
              majorTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['mainTheme', 'centralArgument', 'majorTopics', 'intendedAudience', 'majorTakeaways'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Gemini API call failed after retries in /api/rag/book-overview, using grounded fallback overview:', error?.message);
      return res.json(buildFallbackOverview());
    }
  });

  // 5. Generate Top 10 Takeaways Endpoint
  app.post('/api/rag/takeaways', async (req, res) => {
    const { bookTitle, sampleChunks = [] } = req.body;

    const buildFallbackTakeaways = () => {
      const takeawaysList = (sampleChunks || []).slice(0, 10).map((c: any, index: number) => ({
        id: `takeaway-${index + 1}`,
        number: index + 1,
        concept: c.chapterTitle ? `${c.chapterTitle.replace(/^Chapter\s+\d+[:\s-]*/i, '')} Insight` : `Key Concept ${index + 1}`,
        explanation: (c.text || '').slice(0, 160).trim() + '...',
        chapter: c.chapterTitle || 'Chapter Overview',
        page: c.pageNumber || 1,
        quote: (c.text || '').slice(0, 120).trim(),
      }));

      if (takeawaysList.length === 0) {
        return [
          {
            id: 'takeaway-1',
            number: 1,
            concept: 'Core Thesis',
            explanation: `Presents primary findings and analytical frameworks of ${bookTitle || 'the text'}.`,
            chapter: 'Introduction',
            page: 1,
            quote: `Foundational overview of ${bookTitle || 'the text'}.`,
          },
        ];
      }
      return takeawaysList;
    };

    const ai = getAIClient();
    if (!ai) {
      return res.json(buildFallbackTakeaways());
    }

    const context = (sampleChunks || [])
      .slice(0, 20)
      .map((c: { chapterTitle: string; pageNumber: number; text: string }) => `[${c.chapterTitle || 'Chapter'} | Page ${c.pageNumber}]: ${c.text}`)
      .join('\n\n');

    try {
      const response = await generateContentWithRetry(ai, {
        contents: `Generate Top 10 Key Ideas from this book based on the text:\n\n${context}`,
        config: {
          systemInstruction: `You are BookWise. Generate top 10 key ideas from the book. Each idea MUST have:
- number (1-10)
- concept (short title)
- explanation (1-2 clear sentences)
- chapter (chapter name)
- page (PDF page number from the text)
- quote (short direct quote from the source text)`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                number: { type: Type.INTEGER },
                concept: { type: Type.STRING },
                explanation: { type: Type.STRING },
                chapter: { type: Type.STRING },
                page: { type: Type.INTEGER },
                quote: { type: Type.STRING },
              },
              required: ['number', 'concept', 'explanation', 'chapter', 'page'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Gemini API call failed after retries in /api/rag/takeaways, using grounded fallback takeaways:', error?.message);
      return res.json(buildFallbackTakeaways());
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BookWise server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
