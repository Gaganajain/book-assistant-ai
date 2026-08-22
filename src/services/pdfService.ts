import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
} catch {
  // fallback if needed
}

export interface ExtractedPage {
  pageNumber: number; // 1-indexed PDF page
  text: string;
  lines: string[];
}

export interface ExtractedPDFResult {
  title: string;
  author: string;
  pageCount: number;
  pages: ExtractedPage[];
  isScannedOrEmpty: boolean;
  totalTextLength: number;
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (percent: number, page: number, total: number) => void
): Promise<ExtractedPDFResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  if (pageCount === 0) {
    throw new Error('The uploaded PDF file has 0 pages.');
  }

  let extractedPages: ExtractedPage[] = [];
  let totalChars = 0;

  // Attempt to extract title/author from metadata
  let title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let author = 'Unknown Author';

  try {
    const meta = await pdfDoc.getMetadata();
    if (meta?.info) {
      const info = meta.info as Record<string, string>;
      if (info.Title && info.Title.trim().length > 2) {
        title = info.Title.trim();
      }
      if (info.Author && info.Author.trim().length > 1) {
        author = info.Author.trim();
      }
    }
  } catch (err) {
    console.warn('Could not read PDF metadata info', err);
  }

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items into lines based on transform Y coords or sequence
    const textItems = textContent.items as Array<{ str: string; transform?: number[] }>;
    const lineMap: { [yKey: number]: string[] } = {};
    const lines: string[] = [];

    let rawPageText = '';

    for (const item of textItems) {
      if ('str' in item && typeof item.str === 'string') {
        const str = item.str;
        rawPageText += str + ' ';
      }
    }

    // Clean whitespace and normalize lines
    const normalizedPageText = rawPageText.replace(/\s+/g, ' ').trim();
    totalChars += normalizedPageText.length;

    // Also split by common line break cues or sentence boundaries
    const pageLines = normalizedPageText
      .split(/(?<=[.!?])\s+/)
      .filter((l) => l.trim().length > 0);

    extractedPages.push({
      pageNumber: i,
      text: normalizedPageText,
      lines: pageLines,
    });

    if (onProgress) {
      const pct = Math.round((i / pageCount) * 100);
      onProgress(pct, i, pageCount);
    }
  }

  // Check if PDF is scanned / empty
  const avgCharsPerPage = totalChars / pageCount;
  const isScannedOrEmpty = totalChars < 50 || avgCharsPerPage < 15;

  if (isScannedOrEmpty) {
    throw new Error(
      'This PDF appears to contain scanned pages rather than selectable text. OCR support is not enabled in this MVP. Please upload a PDF with digital selectable text.'
    );
  }

  return {
    title,
    author,
    pageCount,
    pages: extractedPages,
    isScannedOrEmpty: false,
    totalTextLength: totalChars,
  };
}
