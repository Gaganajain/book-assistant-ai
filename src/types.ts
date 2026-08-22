export interface BookChunk {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  sectionTitle?: string;
  pageNumber: number; // PDF page number
  text: string;
  embedding?: number[];
}

export interface BookChapter {
  id: string;
  title: string;
  chapterNumber: number;
  startPage: number;
  endPage: number;
  shortDescription?: string;
  importance?: 'High' | 'Medium' | 'Foundational';
  keyConcepts?: string[];
  summary?: ChapterSummaryData;
}

export interface ChapterSummaryData {
  whatItIsAbout: string[]; // 2-4 paragraphs
  coreIdeas: { idea: string; page?: number }[];
  importantConcepts: { concept: string; explanation: string; page?: number }[];
  keyTakeaways: string[];
  evidenceAndExamples: { example: string; context: string; page?: number }[];
  revisionNotes: { title: string; note: string; source: string; page: number }[];
}

export interface BookOverviewData {
  mainTheme: string;
  centralArgument: string;
  majorTopics: string[];
  intendedAudience: string;
  majorTakeaways: string[];
}

export interface KeyTakeawayItem {
  id: string;
  number: number;
  concept: string;
  explanation: string;
  chapter: string;
  page: number;
  quote?: string;
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  chapters: BookChapter[];
  chunks: BookChunk[];
  overview?: BookOverviewData;
  takeaways?: KeyTakeawayItem[];
  processedAt: string;
  fileName?: string;
  fileSize?: string;
  isDemo?: boolean;
}

export interface CitationSource {
  chunkId: string;
  chapter: string;
  page: number;
  excerpt: string;
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: CitationSource[];
  suggestedFollowUps?: string[];
  timestamp: string;
  isInsufficientEvidence?: boolean;
}

export interface SearchResultItem {
  chunkId: string;
  text: string;
  chapter: string;
  page: number;
  score: number;
  snippet: string;
}

export type ProcessingStep = 
  | 'uploading'
  | 'extracting'
  | 'detecting_chapters'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'ready'
  | 'error';

export interface ProcessingStatus {
  step: ProcessingStep;
  progress: number; // 0 to 100
  message: string;
  error?: string;
}
