import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, FileText, Copy, Check, ChevronLeft, ChevronRight, Bookmark, Sparkles } from 'lucide-react';
import { BookChunk, CitationSource } from '../types';
import { Spotlight } from './motion-primitives';

interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: CitationSource | null;
  allChunks?: BookChunk[];
  onSelectChunk?: (chunk: BookChunk) => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  isOpen,
  onClose,
  source,
  allChunks = [],
  onSelectChunk,
}) => {
  const [copied, setCopied] = useState(false);

  // Find index of current chunk in allChunks if available
  const currentIndex = source ? allChunks.findIndex((c) => c.id === source.chunkId) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allChunks.length - 1;

  const handleCopy = () => {
    if (!source) return;
    navigator.clipboard.writeText(
      `"${source.excerpt}"\n— Source: ${source.chapter}, PDF page ${source.page}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = () => {
    if (hasPrev && onSelectChunk) {
      onSelectChunk(allChunks[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectChunk) {
      onSelectChunk(allChunks[currentIndex + 1]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && source && (
        <div
          id="source-viewer-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            id="source-viewer-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800 text-slate-100"
          >
            <Spotlight fill="rgba(99, 102, 241, 0.15)" size={350} />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-500/30 shadow-xs">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Source Text Verification</h3>
                    <span className="rounded-full bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                      PDF Page {source.page}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-md">{source.chapter}</p>
                </div>
              </div>
              <button
                id="close-source-viewer-btn"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative z-10 p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Metadata Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-3 text-xs text-indigo-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    <span>{source.chapter}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <span>Physical PDF Page: <strong className="text-white">{source.page}</strong></span>
                  </div>
                </div>
                {source.chunkId && (
                  <span className="text-[10px] font-mono text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/30">
                    Chunk #{source.chunkId.replace(/.*chunk_/, '')}
                  </span>
                )}
              </div>

              {/* Source Excerpt */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Extracted Book Text
                </label>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-relaxed text-slate-200 font-serif shadow-inner"
                >
                  <p className="whitespace-pre-wrap">{source.excerpt}</p>
                </motion.div>
              </div>

              <div className="rounded-lg bg-amber-950/40 border border-amber-500/30 p-3 text-[11px] text-amber-300 flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                <p>
                  This text is extracted directly from PDF Page {source.page}. Every factual response in BookWise is anchored to these exact textual extracts.
                </p>
              </div>
            </div>

            {/* Footer controls */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-6 py-3.5">
              <div className="flex items-center gap-2">
                {allChunks.length > 0 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      id="source-prev-chunk-btn"
                      onClick={handlePrev}
                      disabled={!hasPrev}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      id="source-next-chunk-btn"
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="source-copy-quote-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-400" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="source-done-btn"
                  onClick={onClose}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-xs cursor-pointer"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
