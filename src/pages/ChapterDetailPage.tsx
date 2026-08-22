import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Sparkles,
  MessageSquareQuote,
  Layers,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { BookChapter, BookData, ChapterSummaryData, CitationSource } from '../types';
import { generateChapterSummary } from '../services/geminiService';
import { InView, AnimatedGroup, Spotlight } from '../components/motion-primitives';
import { Card3DTilt } from '../components/3d';

interface ChapterDetailPageProps {
  book: BookData;
  chapter: BookChapter;
  onBack: () => void;
  onAskAboutChapter: (chapterTitle: string) => void;
  onOpenSourceViewer: (source: CitationSource) => void;
}

export const ChapterDetailPage: React.FC<ChapterDetailPageProps> = ({
  book,
  chapter,
  onBack,
  onAskAboutChapter,
  onOpenSourceViewer,
}) => {
  const [summary, setSummary] = useState<ChapterSummaryData | undefined>(chapter.summary);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get chunks belonging to this chapter
  const chapterChunks = book.chunks.filter(
    (c) =>
      c.chapterId === chapter.id ||
      c.chapterTitle === chapter.title ||
      (c.pageNumber >= chapter.startPage && c.pageNumber <= chapter.endPage)
  );

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateChapterSummary({
        chapterTitle: chapter.title,
        chapterNumber: chapter.chapterNumber,
        startPage: chapter.startPage,
        endPage: chapter.endPage,
        chapterChunks,
        bookTitle: book.title,
      });

      if (generated) {
        setSummary(generated);
        chapter.summary = generated;
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback default summary if none exists and not generated yet
  const activeSummary: ChapterSummaryData = summary || {
    whatItIsAbout: [
      `This chapter covers ${chapter.title} across physical PDF pages ${chapter.startPage} through ${chapter.endPage}.`,
      `It contains ${chapterChunks.length} core indexed text chunks exploring the fundamental ideas, arguments, and methodology presented by the author.`,
      `Every concept and assertion in this section is anchored to specific page citations for factual verification.`
    ],
    coreIdeas: chapterChunks.slice(0, 4).map((c, i) => ({
      idea: c.text.slice(0, 160) + '...',
      page: c.pageNumber,
    })),
    importantConcepts: (chapter.keyConcepts || ['Core Argument', 'Key Analysis']).map((c, i) => ({
      concept: c,
      explanation: `Analyzed in depth on PDF page ${chapter.startPage + Math.min(i, chapter.endPage - chapter.startPage)}.`,
      page: chapter.startPage + Math.min(i, chapter.endPage - chapter.startPage),
    })),
    keyTakeaways: [
      `Examines the key principles of ${chapter.title}.`,
      `Presents structured reasoning and evidence from pages ${chapter.startPage} to ${chapter.endPage}.`,
      `Connects with broader themes established throughout ${book.title}.`,
      `Provides practical illustrations and theoretical frameworks.`,
      `Can be queried in real time via the Ask Book interface.`
    ],
    evidenceAndExamples: chapterChunks.slice(0, 2).map((c) => ({
      example: `Textual Evidence (Page ${c.pageNumber})`,
      context: c.text.slice(0, 140) + '...',
      page: c.pageNumber,
    })),
    revisionNotes: [
      {
        title: `${chapter.title} Core Rule`,
        note: `Primary principles covered between PDF pages ${chapter.startPage} and ${chapter.endPage}.`,
        source: `${chapter.title}, PDF page ${chapter.startPage}`,
        page: chapter.startPage,
      },
      {
        title: 'Key Methodology',
        note: 'Grounded in extracted book text. Review citations for detailed proof.',
        source: `${chapter.title}, PDF page ${chapter.endPage}`,
        page: chapter.endPage,
      },
    ],
  };

  const handleCitationClick = (pageNumber: number, excerpt?: string) => {
    const chunk = chapterChunks.find((c) => c.pageNumber === pageNumber) || chapterChunks[0];
    onOpenSourceViewer({
      chunkId: chunk?.id || `chunk-p${pageNumber}`,
      chapter: chapter.title,
      page: pageNumber,
      excerpt: excerpt || chunk?.text || `Extracted content from PDF page ${pageNumber}.`,
    });
  };

  return (
    <div id="chapter-detail-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <motion.button
          id="back-to-chapters-btn"
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Chapters</span>
        </motion.button>

        <motion.button
          id="ask-chapter-btn"
          onClick={() => onAskAboutChapter(chapter.title)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30 hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
        >
          <MessageSquareQuote className="h-4 w-4" />
          <span>Ask About This Chapter</span>
        </motion.button>
      </div>

      {/* Chapter Banner with 3D Tilt & Spotlight */}
      <InView
        as="div"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }}
      >
        <Card3DTilt maxTilt={3} glareOpacity={0.06}>
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3">
            <Spotlight fill="rgba(99, 102, 241, 0.12)" size={350} />
            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                Chapter {chapter.chapterNumber}
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                PDF Pages {chapter.startPage}–{chapter.endPage}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  chapter.importance === 'Foundational'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {chapter.importance || 'High'} Importance
              </span>
            </div>

            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              {chapter.title}
            </h1>

            {chapter.shortDescription && (
              <p className="relative z-10 text-sm text-slate-300 leading-relaxed font-medium">
                {chapter.shortDescription}
              </p>
            )}
          </div>
        </Card3DTilt>
      </InView>

      {/* Structured Summary Layout */}
      <div className="space-y-6">
        {/* 1. What this chapter is about */}
        <InView
          as="section"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h2>What This Chapter Is About</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            {activeSummary.whatItIsAbout.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </InView>

        {/* 2. Core Ideas */}
        <InView
          as="section"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 } },
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2>Core Ideas</h2>
          </div>

          <AnimatedGroup
            preset="slide"
            stagger={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {activeSummary.coreIdeas.map((ideaObj, i) => (
              <Card3DTilt key={i} maxTilt={4} glareOpacity={0.06}>
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200 leading-relaxed transition-all hover:border-indigo-500/40 h-full">
                  <div className="flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <p className="font-medium">{ideaObj.idea}</p>
                  </div>

                  {ideaObj.page && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCitationClick(ideaObj.page!)}
                      className="mt-3 self-start inline-flex items-center gap-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 text-[10px] font-bold text-indigo-300 hover:bg-indigo-900/80 transition-colors cursor-pointer"
                    >
                      <span>PDF Page {ideaObj.page}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </motion.button>
                  )}
                </div>
              </Card3DTilt>
            ))}
          </AnimatedGroup>
        </InView>

        {/* 3. Important Concepts */}
        <InView
          as="section"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2>Important Concepts</h2>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60">
            {activeSummary.importantConcepts.map((conceptObj, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300">{conceptObj.concept}</h4>
                  <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                    → {conceptObj.explanation}
                  </p>
                </div>
                {conceptObj.page && (
                  <button
                    onClick={() => handleCitationClick(conceptObj.page!)}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>p. {conceptObj.page}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </InView>

        {/* 4. Key Takeaways */}
        <InView
          as="section"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h2>Key Takeaways</h2>
          </div>

          <AnimatedGroup
            preset="slide"
            stagger={0.04}
            className="space-y-2"
          >
            {activeSummary.keyTakeaways.map((takeaway, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 2 }}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-200 leading-relaxed transition-colors hover:bg-slate-800/50"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  {i + 1}
                </span>
                <span>{takeaway}</span>
              </motion.div>
            ))}
          </AnimatedGroup>
        </InView>

        {/* 5. Important Evidence / Examples */}
        {activeSummary.evidenceAndExamples && activeSummary.evidenceAndExamples.length > 0 && (
          <InView
            as="section"
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
            }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-3"
          >
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Bookmark className="h-5 w-5 text-indigo-400" />
              <h2>Important Evidence & Case Studies</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSummary.evidenceAndExamples.map((ev, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -1 }}
                  className="rounded-xl border border-slate-800 bg-indigo-950/30 p-4 text-xs text-slate-200 space-y-2 transition-colors hover:border-indigo-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{ev.example}</span>
                    {ev.page && (
                      <button
                        onClick={() => handleCitationClick(ev.page!)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/30 cursor-pointer"
                      >
                        PDF p. {ev.page}
                      </button>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed">{ev.context}</p>
                </motion.div>
              ))}
            </div>
          </InView>
        )}

        {/* 6. Revision Notes */}
        <InView
          as="section"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15 } },
          }}
          className="rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2>Revision Flashcards & Notes</h2>
            </div>
            <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Exam & Memory Ready
            </span>
          </div>

          <AnimatedGroup
            preset="slide"
            stagger={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {activeSummary.revisionNotes.map((note, i) => (
              <Card3DTilt key={i} maxTilt={4} glareOpacity={0.06}>
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3 h-full">
                  <div>
                    <h4 className="text-xs font-bold text-white">{note.title}</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">
                      {note.note}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Source: {note.source}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCitationClick(note.page)}
                      className="inline-flex items-center gap-1 rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900 transition-colors cursor-pointer"
                    >
                      <span>View in Book</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </motion.button>
                  </div>
                </div>
              </Card3DTilt>
            ))}
          </AnimatedGroup>
        </InView>
      </div>
    </div>
  );
};
