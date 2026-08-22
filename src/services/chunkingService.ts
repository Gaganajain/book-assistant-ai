import { BookChapter, BookChunk } from '../types';
import { ExtractedPage } from './pdfService';

const CHAPTER_REGEX_PATTERNS = [
  /^(chapter\s+(\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty))[:\s\.\-—]*(.*)$/i,
  /^(part\s+(\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten))[:\s\.\-—]*(.*)$/i,
  /^(section\s+(\d+|[ivxlcdm]+))[:\s\.\-—]*(.*)$/i,
  /^(introduction|prologue|epilogue|conclusion|preface|foreword|appendix)[:\s\.\-—]*(.*)$/i,
];

export function detectChaptersFromPages(pages: ExtractedPage[]): BookChapter[] {
  const detected: Array<{
    pageNumber: number;
    title: string;
    chapterNumber: number;
  }> = [];

  let chapterCounter = 1;

  for (const page of pages) {
    const text = page.text.trim();
    if (!text) continue;

    // Check first 300 characters of each page for chapter heading cues
    const pageHeaderSample = text.slice(0, 400);
    const sentences = pageHeaderSample.split(/(?<=[.!?\n])\s+/);

    for (const sentence of sentences.slice(0, 3)) {
      const clean = sentence.trim();
      for (const pattern of CHAPTER_REGEX_PATTERNS) {
        const match = clean.match(pattern);
        if (match) {
          let title = clean.slice(0, 80);
          // If title is just "Chapter 1", look if there is a subtitle
          if (title.length < 12 && sentences.length > 1) {
            const nextPart = sentences[1]?.trim() || '';
            if (nextPart && nextPart.length < 60) {
              title = `${title}: ${nextPart}`;
            }
          }

          // Avoid duplicate triggers on the same page
          if (!detected.some((d) => d.pageNumber === page.pageNumber)) {
            detected.push({
              pageNumber: page.pageNumber,
              title: title.replace(/[:.\s]+$/, ''),
              chapterNumber: chapterCounter++,
            });
          }
          break;
        }
      }
    }
  }

  // If chapter detection found fewer than 2 chapters, create sensible page-based sections
  if (detected.length < 2) {
    const totalPages = pages.length;
    const pagesPerSection = Math.max(3, Math.ceil(totalPages / 5));
    const sectionsCount = Math.ceil(totalPages / pagesPerSection);

    const generatedChapters: BookChapter[] = [];
    for (let s = 0; s < sectionsCount; s++) {
      const startP = s * pagesPerSection + 1;
      const endP = Math.min(totalPages, (s + 1) * pagesPerSection);
      const startPageObj = pages.find((p) => p.pageNumber === startP);
      
      // Extract a descriptive title from first sentence
      let descTitle = `Section ${s + 1}`;
      if (startPageObj && startPageObj.text) {
        const firstSentence = startPageObj.text.slice(0, 60).replace(/[.!?].*$/, '').trim();
        if (firstSentence.length > 5) {
          descTitle = `Section ${s + 1}: ${firstSentence}`;
        }
      }

      generatedChapters.push({
        id: `sec-${s + 1}`,
        chapterNumber: s + 1,
        title: descTitle,
        startPage: startP,
        endPage: endP,
        importance: s === 0 ? 'Foundational' : 'High',
        shortDescription: `Covers pages ${startP} to ${endP} of the uploaded book.`,
        keyConcepts: [`Part ${s + 1} Core Themes`, `Pages ${startP}–${endP}`],
      });
    }

    return generatedChapters;
  }

  // Build chapter list with start/end pages
  const chapters: BookChapter[] = [];
  for (let i = 0; i < detected.length; i++) {
    const curr = detected[i];
    const next = detected[i + 1];
    const startP = curr.pageNumber;
    const endP = next ? next.pageNumber - 1 : pages[pages.length - 1].pageNumber;

    chapters.push({
      id: `ch-${curr.chapterNumber}`,
      chapterNumber: curr.chapterNumber,
      title: curr.title,
      startPage: startP,
      endPage: Math.max(startP, endP),
      importance: curr.chapterNumber === 1 ? 'Foundational' : 'High',
      shortDescription: `Covers ${curr.title} from page ${startP} to ${Math.max(startP, endP)}.`,
      keyConcepts: [curr.title.replace(/^Chapter\s+\d+[:\s-]*/i, '') || `Key Concepts`],
    });
  }

  return chapters;
}

export function chunkPages(
  bookId: string,
  pages: ExtractedPage[],
  chapters: BookChapter[],
  options = { targetChunkSize: 500, overlap: 80 }
): BookChunk[] {
  const chunks: BookChunk[] = [];
  let chunkCounter = 1;

  for (const page of pages) {
    const pageText = page.text.trim();
    if (!pageText) continue;

    // Find which chapter this page belongs to
    const chapter =
      chapters.find(
        (ch) => page.pageNumber >= ch.startPage && page.pageNumber <= ch.endPage
      ) || chapters[0] || {
        id: 'ch-general',
        title: 'General Content',
        chapterNumber: 1,
      };

    // Split page into paragraphs or sentence groups
    const sentences = pageText.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);

    let currentChunkText = '';
    let sectionTitle = chapter.title;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      if ((currentChunkText + ' ' + sentence).length > options.targetChunkSize) {
        if (currentChunkText.trim().length > 40) {
          chunks.push({
            id: `${bookId}_chunk_${chunkCounter++}`,
            bookId,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sectionTitle,
            pageNumber: page.pageNumber,
            text: currentChunkText.trim(),
          });
        }

        // Apply overlap from end of currentChunkText
        const words = currentChunkText.split(' ');
        const overlapWords = words.slice(-6).join(' ');
        currentChunkText = overlapWords + ' ' + sentence;
      } else {
        currentChunkText = currentChunkText ? `${currentChunkText} ${sentence}` : sentence;
      }
    }

    // Flush remaining text
    if (currentChunkText.trim().length > 20) {
      chunks.push({
        id: `${bookId}_chunk_${chunkCounter++}`,
        bookId,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        sectionTitle,
        pageNumber: page.pageNumber,
        text: currentChunkText.trim(),
      });
    }
  }

  return chunks;
}
