import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Layers, Sparkles, ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import { BookChapter, BookData } from '../types';
import { Card3DTilt } from '../components/3d';
import { Spotlight, AnimatedGroup } from '../components/motion-primitives';

interface ChaptersPageProps {
  book: BookData;
  onSelectChapter: (chapterId: string) => void;
}

export const ChaptersPage: React.FC<ChaptersPageProps> = ({
  book,
  onSelectChapter,
}) => {
  return (
    <div id="chapters-browser-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              {book.chapters.length} Chapters Detected
            </span>
            <span className="text-xs text-slate-400 font-medium">Pages 1 to {book.pageCount}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-serif">
            Chapter Browser
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a chapter to explore its structured summary, core ideas, key concepts, and revision notes.
          </p>
        </div>
      </div>

      {/* Chapters Grid with 3D Card Tilt */}
      <AnimatedGroup preset="slide" stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {book.chapters.map((chapter) => {
          return (
            <Card3DTilt key={chapter.id} id={`chapter-card-${chapter.id}`} maxTilt={5} glareOpacity={0.08}>
              <div
                onClick={() => onSelectChapter(chapter.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between h-full"
              >
                <Spotlight fill="rgba(99, 102, 241, 0.1)" size={280} />

                <div className="relative z-10 space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      Chapter {chapter.chapterNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          chapter.importance === 'Foundational'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {chapter.importance || 'High'} Importance
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-slate-500" />
                        <span>pp. {chapter.startPage}–{chapter.endPage}</span>
                      </span>
                    </div>
                  </div>

                  {/* Chapter Title */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {chapter.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {chapter.shortDescription || `Covers pages ${chapter.startPage} to ${chapter.endPage} of the book.`}
                    </p>
                  </div>

                  {/* Key Concepts Chips */}
                  {chapter.keyConcepts && chapter.keyConcepts.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Key Concepts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {chapter.keyConcepts.map((concept, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-800/90 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="relative z-10 mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>View Summary & Revision Notes</span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card3DTilt>
          );
        })}
      </AnimatedGroup>
    </div>
  );
};
