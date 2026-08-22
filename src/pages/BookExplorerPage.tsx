import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Compass, BookOpen, FileText, ExternalLink, Filter, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { BookData, CitationSource, SearchResultItem } from '../types';
import { searchBookChunks } from '../services/retrievalService';
import { InView, AnimatedGroup, Spotlight } from '../components/motion-primitives';
import { Card3DTilt } from '../components/3d';

interface BookExplorerPageProps {
  book: BookData;
  onOpenSourceViewer: (source: CitationSource) => void;
  onAskAboutResult: (text: string) => void;
}

export const BookExplorerPage: React.FC<BookExplorerPageProps> = ({
  book,
  onOpenSourceViewer,
  onAskAboutResult,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');

  const filteredChunks =
    selectedChapter === 'all'
      ? book.chunks
      : book.chunks.filter((c) => c.chapterId === selectedChapter);

  const searchResults = searchBookChunks(searchQuery, filteredChunks);

  const handleResultClick = (res: SearchResultItem) => {
    onOpenSourceViewer({
      chunkId: res.chunkId,
      chapter: res.chapter,
      page: res.page,
      excerpt: res.text,
    });
  };

  return (
    <div id="book-explorer-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
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
            <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              Full-Text Retrieval
            </span>
            <span className="text-xs text-slate-400 font-medium">{book.chunks.length} Total Chunks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-serif">
            Book Explorer & Search
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Locate exact sentences, terminology, and chapters across all {book.pageCount} physical PDF pages.
          </p>
        </div>
      </InView>

      {/* Search Input & Chapter Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="book-explorer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search this book... (e.g. 'Bat and Ball', 'Asian Disease', 'Gary Klein', 'Parole')"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Chapter filter dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            id="explorer-chapter-filter"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-200 shadow-xs focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">All Chapters ({book.chapters.length})</option>
            {book.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch {ch.chapterNumber}: {ch.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Search Chips */}
      {!searchQuery && (
        <InView
          as="div"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
          }}
          className="space-y-2"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Suggested Search Terms:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['System 1 and System 2', 'Cognitive Ease', 'Loss Aversion', 'WYSIATI', 'Pre-Mortem', 'Anchoring', 'Default Effect'].map((term) => (
              <motion.button
                key={term}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSearchQuery(term)}
                className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-indigo-950/80 hover:text-indigo-200 hover:border-indigo-500/30 border border-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                {term}
              </motion.button>
            ))}
          </div>
        </InView>
      )}

      {/* Search Results List */}
      <div className="space-y-3">
        {searchQuery ? (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
              <span>Found {searchResults.length} matching sections</span>
              {selectedChapter !== 'all' && <span>Filtered by chapter</span>}
            </div>

            {searchResults.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-12 text-center space-y-2">
                <Compass className="h-8 w-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No matching text found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No chunks matched "{searchQuery}". Try using different keywords or selecting "All Chapters".
                </p>
              </div>
            ) : (
              <AnimatedGroup
                preset="slide"
                stagger={0.04}
                className="space-y-3"
              >
                {searchResults.map((res, i) => (
                  <Card3DTilt key={res.chunkId} id={`search-result-${i}`} maxTilt={3} glareOpacity={0.06}>
                    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl hover:border-indigo-500/40 transition-all space-y-2.5">
                      <Spotlight fill="rgba(99, 102, 241, 0.08)" size={280} />
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                            PDF Page {res.page}
                          </span>
                          <span className="text-xs font-semibold text-white flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{res.chapter}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleResultClick(res)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors shadow-xs cursor-pointer"
                          >
                            <span>View in Book</span>
                            <ExternalLink className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </div>

                      <p className="relative z-10 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        {res.snippet}
                      </p>

                      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Relevance Score: {Math.round(res.score * 100)}%</span>
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => onAskAboutResult(`Tell me more about: "${res.text.slice(0, 80)}"`)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ask AI about this</span>
                          <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>
                  </Card3DTilt>
                ))}
              </AnimatedGroup>
            )}
          </>
        ) : (
          /* Browse All Chunks */
          <InView
            as="div"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Browsing {filteredChunks.length} Chunks
            </div>
            <AnimatedGroup
              preset="slide"
              stagger={0.03}
              className="space-y-3"
            >
              {filteredChunks.slice(0, 8).map((chunk) => (
                <Card3DTilt key={chunk.id} maxTilt={3} glareOpacity={0.05}>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl hover:border-indigo-500/40 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                          PDF Page {chunk.pageNumber}
                        </span>
                        <span className="text-xs font-semibold text-white">{chunk.chapterTitle}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          onOpenSourceViewer({
                            chunkId: chunk.id,
                            chapter: chunk.chapterTitle,
                            page: chunk.pageNumber,
                            excerpt: chunk.text,
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </motion.button>
                    </div>
                    <p className="text-xs text-slate-300 font-serif leading-relaxed line-clamp-3">
                      {chunk.text}
                    </p>
                  </div>
                </Card3DTilt>
              ))}
            </AnimatedGroup>
          </InView>
        )}
      </div>
    </div>
  );
};
