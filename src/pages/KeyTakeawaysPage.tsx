import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, FileText, ExternalLink, Bookmark, Copy, Check, MessageSquareQuote } from 'lucide-react';
import { BookData, CitationSource, KeyTakeawayItem } from '../types';
import { generateTopTakeaways } from '../services/geminiService';
import { InView, AnimatedGroup, Spotlight } from '../components/motion-primitives';
import { Card3DTilt } from '../components/3d';

interface KeyTakeawaysPageProps {
  book: BookData;
  onOpenSourceViewer: (source: CitationSource) => void;
  onAskAboutConcept: (concept: string) => void;
}

export const KeyTakeawaysPage: React.FC<KeyTakeawaysPageProps> = ({
  book,
  onOpenSourceViewer,
  onAskAboutConcept,
}) => {
  const [takeaways, setTakeaways] = useState<KeyTakeawayItem[]>(() => {
    if (book.takeaways && book.takeaways.length > 0) return book.takeaways;
    // Synthesize 10 takeaways from book chunks if not pre-populated
    return book.chunks.slice(0, 10).map((c, idx) => ({
      id: `takeaway-${idx + 1}`,
      number: idx + 1,
      concept: c.sectionTitle || `${c.chapterTitle} Principle ${idx + 1}`,
      explanation: c.text.slice(0, 180) + '...',
      chapter: c.chapterTitle,
      page: c.pageNumber,
      quote: c.text,
    }));
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTakeaway = (item: KeyTakeawayItem) => {
    navigator.clipboard.writeText(
      `${item.number}. ${item.concept}\n${item.explanation}\nSource: ${item.chapter}, PDF page ${item.page}`
    );
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewSource = (item: KeyTakeawayItem) => {
    const chunk = book.chunks.find((c) => c.pageNumber === item.page) || book.chunks[0];
    onOpenSourceViewer({
      chunkId: chunk?.id || `chunk-p${item.page}`,
      chapter: item.chapter,
      page: item.page,
      excerpt: item.quote || chunk?.text || item.explanation,
    });
  };

  return (
    <div id="key-takeaways-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <InView
        as="div"
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-5"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
              Revision Flashcards
            </span>
            <span className="text-xs text-slate-400 font-medium">{takeaways.length} Key Concepts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-serif">
            Top 10 Ideas From This Book
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Essential principles, mental models, and frameworks extracted with verifiable page citations.
          </p>
        </div>
      </InView>

      {/* Takeaways List */}
      <AnimatedGroup
        preset="slide"
        stagger={0.05}
        className="space-y-4"
      >
        {takeaways.map((item) => (
          <Card3DTilt key={item.id} id={`takeaway-card-${item.number}`} maxTilt={3} glareOpacity={0.06}>
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl hover:border-indigo-500/40 transition-all space-y-3">
              <Spotlight fill="rgba(99, 102, 241, 0.08)" size={280} />
              {/* Top row */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                    {item.number}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.concept}
                  </h3>
                </div>

                {/* Source badge */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewSource(item)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-900/80 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  <span>PDF Page {item.page}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </motion.button>
              </div>

              {/* Explanation */}
              <p className="relative z-10 text-xs sm:text-sm text-slate-300 leading-relaxed pl-10 font-normal">
                {item.explanation}
              </p>

              {/* Quote block if available */}
              {item.quote && (
                <div className="relative z-10 pl-10">
                  <blockquote className="rounded-xl border-l-2 border-indigo-500 bg-slate-950/60 p-3 text-xs italic text-slate-300 font-serif">
                    "{item.quote}"
                  </blockquote>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="relative z-10 pl-10 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  Chapter: <strong className="text-slate-200">{item.chapter}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopyTakeaway(item)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <motion.button
                    whileHover={{ x: 1 }}
                    onClick={() => onAskAboutConcept(item.concept)}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    <span>Ask in Chat</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </Card3DTilt>
        ))}
      </AnimatedGroup>
    </div>
  );
};
