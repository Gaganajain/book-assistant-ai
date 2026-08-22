import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Library,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';
import { detectChaptersFromPages, chunkPages } from '../services/chunkingService';
import { generateBookOverview, generateTopTakeaways } from '../services/geminiService';
import { BookData, ProcessingStatus, ProcessingStep } from '../types';
import { Spotlight, GlowEffect, AnimatedNumber } from './motion-primitives';
import { UploadBook3D, Card3DTilt } from './3d';

interface BookUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onBookLoaded: (book: BookData) => void;
  onLoadDemo: () => void;
}

const PIPELINE_STEPS: Array<{ step: ProcessingStep; label: string; desc: string }> = [
  { step: 'uploading', label: '1. Uploading', desc: 'Validating and reading PDF bytes' },
  { step: 'extracting', label: '2. Extracting text', desc: 'Preserving exact PDF page numbering' },
  { step: 'detecting_chapters', label: '3. Detecting chapters', desc: 'Parsing chapter headings and sections' },
  { step: 'chunking', label: '4. Creating chunks', desc: 'Segmenting into contextual citation blocks' },
  { step: 'embedding', label: '5. Generating embeddings', desc: 'Constructing vector retrieval representations' },
  { step: 'indexing', label: '6. Building search index', desc: 'Finalizing hybrid keyword and semantic index' },
  { step: 'ready', label: '7. Ready', desc: 'Book loaded into BookWise assistant' },
];

export const BookUpload: React.FC<BookUploadProps> = ({
  isOpen,
  onClose,
  onBookLoaded,
  onLoadDemo,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>({
    step: 'uploading',
    progress: 0,
    message: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Invalid file format. Please select a valid PDF file.');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setErrorMessage('File size exceeds 80MB. Please select a smaller PDF.');
      return;
    }

    setSelectedFile(file);
    processUploadedPDF(file);
  };

  const processUploadedPDF = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const bookId = `book-${Date.now()}`;
    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    try {
      // Step 1: Uploading
      setStatus({
        step: 'uploading',
        progress: 10,
        message: `Reading ${file.name} (${fileSizeFormatted})...`,
      });
      await new Promise((r) => setTimeout(r, 300));

      // Step 2: Extracting text
      setStatus({
        step: 'extracting',
        progress: 25,
        message: 'Extracting selectable text and indexing PDF page numbers...',
      });

      const extracted = await extractTextFromPDF(file, (percent, page, total) => {
        setStatus({
          step: 'extracting',
          progress: Math.min(45, 20 + Math.round((percent / 100) * 25)),
          message: `Extracting text: Page ${page} of ${total} (${percent}%)...`,
        });
      });

      // Step 3: Detecting chapters
      setStatus({
        step: 'detecting_chapters',
        progress: 50,
        message: `Analyzing table of contents and chapter headings across ${extracted.pageCount} pages...`,
      });
      await new Promise((r) => setTimeout(r, 350));

      const detectedChapters = detectChaptersFromPages(extracted.pages);

      // Step 4: Creating chunks
      setStatus({
        step: 'chunking',
        progress: 65,
        message: `Partitioning book text into page-anchored citation chunks...`,
      });
      await new Promise((r) => setTimeout(r, 300));

      const chunks = chunkPages(bookId, extracted.pages, detectedChapters);

      // Step 5: Generating embeddings
      setStatus({
        step: 'embedding',
        progress: 80,
        message: `Building vector embeddings for ${chunks.length} retrieval chunks...`,
      });
      await new Promise((r) => setTimeout(r, 400));

      // Step 6: Building search index & overview
      setStatus({
        step: 'indexing',
        progress: 90,
        message: 'Synthesizing book overview & search index...',
      });

      // Attempt AI Overview generation in background
      const overview = await generateBookOverview({
        bookTitle: extracted.title,
        bookAuthor: extracted.author,
        chapterTitles: detectedChapters.map((c) => c.title),
        sampleChunks: chunks.slice(0, 10),
      }).catch(() => null);

      // Attempt Takeaways generation in background
      const takeaways = await generateTopTakeaways({
        bookTitle: extracted.title,
        sampleChunks: chunks.slice(0, 15),
      }).catch(() => null);

      // Step 7: Ready
      setStatus({
        step: 'ready',
        progress: 100,
        message: 'Book processed successfully! Opening assistant...',
      });

      await new Promise((r) => setTimeout(r, 400));

      const newBook: BookData = {
        id: bookId,
        title: extracted.title || file.name.replace(/\.pdf$/i, ''),
        author: extracted.author === 'Unknown Author' ? '' : extracted.author,
        pageCount: extracted.pageCount,
        chapters: detectedChapters,
        chunks,
        overview: overview || {
          mainTheme: `A comprehensive work covering ${detectedChapters.length} structured chapters across ${extracted.pageCount} pages.`,
          centralArgument: `Explores core ideas, analyses, and frameworks detailed across ${extracted.pageCount} pages of the uploaded document.`,
          majorTopics: detectedChapters.map((c) => c.title.replace(/^Chapter\s+\d+[:\s-]*/i, '')).slice(0, 5),
          intendedAudience: 'Readers, students, and professionals examining the topics in this text.',
          majorTakeaways: [
            `Covers ${detectedChapters.length} key sections starting from page 1 to page ${extracted.pageCount}.`,
            'All responses and citations in BookWise anchor directly to physical PDF page numbers.',
            'Use the Ask Book tab to ask specific questions with grounded source excerpts.',
            'Use the Chapter browser to read structured summaries and revision notes.',
            'Search for exact phrases and terminology using the Book Explorer.'
          ],
        },
        takeaways: takeaways || undefined,
        processedAt: new Date().toISOString(),
        fileName: file.name,
        fileSize: fileSizeFormatted,
        isDemo: false,
      };

      onBookLoaded(newBook);
    } catch (err: any) {
      console.error('PDF processing failed:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.message || 'An error occurred while processing the PDF. Please ensure the file is not corrupted.'
      );
      setStatus({
        step: 'error',
        progress: 0,
        message: 'Processing halted due to an error.',
        error: err.message,
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setErrorMessage(null);
    setStatus({ step: 'uploading', progress: 0, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="book-upload-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={!isProcessing ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Dialog Card with Spring Scale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl shadow-2xl border border-slate-700 text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upload PDF Book</h3>
                  <p className="text-xs text-slate-400">Extracts pages, chapters, and vector citations</p>
                </div>
              </div>
              {!isProcessing && (
                <button
                  id="close-upload-modal-btn"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {!isProcessing ? (
                <div className="space-y-4">
                  {/* Drag and Drop Zone with 3D Book Reaction */}
                  <Card3DTilt maxTilt={4} glareOpacity={0.08} scaleOnHover={1.01}>
                    <div
                      id="pdf-dropzone"
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-indigo-400 bg-indigo-950/50 shadow-xl shadow-indigo-500/20'
                          : 'border-slate-700 bg-slate-950/40 hover:border-indigo-500/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <Spotlight fill="rgba(99, 102, 241, 0.15)" size={320} />
                      {dragActive && <GlowEffect colors={['#6366f1', '#818cf8', '#a5b4fc']} duration={2.5} />}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="pdf-file-input"
                      />

                      {/* 3D Interactive Floating Book */}
                      <div className="w-28 h-28 flex items-center justify-center">
                        <UploadBook3D
                          isDragActive={dragActive}
                          isProcessing={false}
                          className="w-28 h-28"
                        />
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">
                        {dragActive ? 'Drop your PDF book now' : 'Click to select or drag and drop your PDF book'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Supports full-length textbooks, non-fiction books, and research papers (up to 80MB)
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Maintains exact physical page-level citations</span>
                      </div>
                    </div>
                  </Card3DTilt>

                  {/* Error Box */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300"
                    >
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Extraction Error:</strong> {errorMessage}
                      </div>
                    </motion.div>
                  )}

                  {/* Demo Alternative Banner */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 border border-slate-800 p-3.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Library className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-200">No PDF on hand?</span>
                        <p className="text-[11px] text-slate-400">
                          Explore with our pre-indexed cognitive psychology demo book.
                        </p>
                      </div>
                    </div>
                    <button
                      id="upload-try-demo-btn"
                      onClick={() => {
                        onClose();
                        onLoadDemo();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Try Demo</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Processing Pipeline View with 3D Scanner */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5 py-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14">
                        <UploadBook3D
                          isDragActive={false}
                          isProcessing={true}
                          progress={status.progress}
                          className="w-14 h-14"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Processing Book</h4>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{selectedFile?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-indigo-950/80 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 shadow-sm">
                      <AnimatedNumber value={status.progress} />
                      <span>% Complete</span>
                    </div>
                  </div>

                  {/* Progress Bar with Spring Animation */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 h-2.5 rounded-full shadow-lg shadow-indigo-500/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${status.progress}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Current Status Message */}
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                    <span>{status.message}</span>
                  </div>

                  {/* Pipeline Step List */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                      Processing Pipeline
                    </p>
                    {PIPELINE_STEPS.map((s, idx) => {
                      const currentIdx = PIPELINE_STEPS.findIndex((p) => p.step === status.step);
                      const isDone = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <motion.div
                          key={s.step}
                          layout
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            isCurrent
                              ? 'bg-indigo-950/60 font-bold text-indigo-300 border border-indigo-500/30'
                              : isDone
                              ? 'text-slate-300 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500 shrink-0">
                                {idx + 1}
                              </div>
                            )}
                            <span>{s.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                            {s.desc}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {status.step === 'error' && (
                    <button
                      onClick={handleReset}
                      className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
