import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  MessageSquareQuote,
  Compass,
  CheckCircle2,
  Users,
  Target,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import { BookData, CitationSource } from '../types';
import {
  AnimatedNumber,
  Spotlight,
  InView,
  AnimatedGroup,
} from '../components/motion-primitives';
import { Card3DTilt } from '../components/3d';

interface DashboardOverviewProps {
  book: BookData;
  onNavigate: (tab: string, chapterId?: string) => void;
  onOpenSourceViewer: (source: CitationSource) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  book,
  onNavigate,
  onOpenSourceViewer,
}) => {
  const overview = book.overview || {
    mainTheme: 'Not clearly available in the uploaded book.',
    centralArgument: 'Not clearly available in the uploaded book.',
    majorTopics: [],
    intendedAudience: 'Not clearly available in the uploaded book.',
    majorTakeaways: [],
  };

  return (
    <div id="dashboard-overview-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Book Title & Metadata Header Card with 3D Tilt & Spotlight */}
      <InView
        as="div"
        variants={{
          hidden: { opacity: 0, y: 14 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        }}
      >
        <Card3DTilt maxTilt={3} glareOpacity={0.08}>
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
            <Spotlight fill="rgba(99, 102, 241, 0.15)" size={400} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                    Book Analysis
                  </span>
                  {book.isDemo && (
                    <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                      Demo Book
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Indexed & Ready
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                  {book.title}
                </h1>
                <p className="text-sm font-medium text-slate-400">
                  {book.author ? `By ${book.author}` : 'Author: Not detected in metadata'}
                </p>
              </div>

              {/* Quick CTA */}
              <div className="flex items-center gap-2.5 shrink-0">
                <motion.button
                  id="overview-ask-btn"
                  onClick={() => onNavigate('ask')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30 hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
                >
                  <MessageSquareQuote className="h-4 w-4" />
                  <span>Ask Book</span>
                </motion.button>
                <motion.button
                  id="overview-browse-chapters-btn"
                  onClick={() => onNavigate('chapters')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>Browse Chapters</span>
                </motion.button>
              </div>
            </div>

            {/* Animated Number Stats Grid with 3D Depth */}
            <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800 pt-5">
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 transition-shadow hover:border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span>PDF Pages</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  <AnimatedNumber value={book.pageCount} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 transition-shadow hover:border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>Chapters</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  <AnimatedNumber value={book.chapters.length} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 transition-shadow hover:border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Citation Chunks</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  <AnimatedNumber value={book.chunks.length} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 transition-shadow hover:border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>Processed</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {new Date(book.processedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card3DTilt>
      </InView>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Thesis & Argument (2 cols on large) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Central Theme & Argument */}
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
          >
            <Card3DTilt maxTilt={3} glareOpacity={0.06}>
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <Spotlight fill="rgba(99, 102, 241, 0.1)" size={300} />
                <div className="relative z-10 flex items-center gap-2 text-indigo-300 font-bold text-base">
                  <Target className="h-5 w-5 text-indigo-400" />
                  <h2>Book Overview & Core Thesis</h2>
                </div>

                <div className="relative z-10 space-y-4 text-sm text-slate-300 leading-relaxed">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Main Theme
                    </h3>
                    <p className="rounded-xl bg-slate-950/60 border border-slate-800 p-3.5 text-slate-200 font-medium">
                      {overview.mainTheme}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Central Argument
                    </h3>
                    <p className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-3.5 text-slate-200 leading-relaxed">
                      {overview.centralArgument}
                    </p>
                  </div>
                </div>
              </div>
            </Card3DTilt>
          </InView>

          {/* 5 Major Takeaways */}
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.1 } },
            }}
          >
            <Card3DTilt maxTilt={3} glareOpacity={0.06}>
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <Spotlight fill="rgba(99, 102, 241, 0.1)" size={300} />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-base">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <h2>5 Major Book Takeaways</h2>
                  </div>
                  <button
                    id="view-all-takeaways-btn"
                    onClick={() => onNavigate('takeaways')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group cursor-pointer"
                  >
                    <span>View Top 10</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                <AnimatedGroup
                  preset="slide"
                  stagger={0.06}
                  className="relative z-10 space-y-2.5"
                >
                  {(overview.majorTakeaways && overview.majorTakeaways.length > 0
                    ? overview.majorTakeaways
                    : [
                        'Covers foundational cognitive and decision-making concepts.',
                        'Examines heuristic shortcuts and biases under uncertainty.',
                        'Presents empirical research grounded in peer-reviewed studies.',
                        'Connects descriptive findings with actionable decision hygiene.',
                        'Provides page-level verification for all factual claims.'
                      ]
                  ).map((takeaway, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -1, x: 2 }}
                      className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-200 leading-relaxed transition-colors hover:bg-slate-800/60"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white shadow-xs">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </motion.div>
                  ))}
                </AnimatedGroup>
              </div>
            </Card3DTilt>
          </InView>
        </div>

        {/* Right Column: Topics, Audience & Chapter Shortcuts */}
        <div className="space-y-6">
          {/* Major Topics */}
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.05 } },
            }}
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Major Topics & Themes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {overview.majorTopics && overview.majorTopics.length > 0 ? (
                  overview.majorTopics.map((topic, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-lg bg-indigo-950/80 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 transition-colors"
                    >
                      {topic}
                    </motion.span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Not clearly available in the uploaded book.</span>
                )}
              </div>
            </div>
          </InView>

          {/* Intended Audience */}
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.1 } },
            }}
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Intended Audience</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {overview.intendedAudience}
              </p>
            </div>
          </InView>

          {/* Chapter Quick List */}
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.15 } },
            }}
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chapter Directory
                </h3>
                <button
                  onClick={() => onNavigate('chapters')}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  All ({book.chapters.length})
                </button>
              </div>

              <AnimatedGroup
                preset="slide"
                stagger={0.04}
                className="space-y-1.5"
              >
                {book.chapters.slice(0, 5).map((ch) => (
                  <motion.button
                    key={ch.id}
                    onClick={() => onNavigate('chapters', ch.id)}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300 truncate block">
                        {ch.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Pages {ch.startPage}–{ch.endPage}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                ))}
              </AnimatedGroup>
            </div>
          </InView>
        </div>
      </div>
    </div>
  );
};
