import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareQuote,
  Sparkles,
  Compass,
  FileText,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { BookData } from '../types';

interface SidebarProps {
  currentBook: BookData | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentBook,
  activeTab,
  onSelectTab,
  onOpenUpload,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      desc: 'Book thesis & structure',
    },
    {
      id: 'chapters',
      label: 'Chapters',
      icon: BookOpen,
      desc: `${currentBook?.chapters.length || 0} chapters detected`,
      badge: currentBook?.chapters.length,
    },
    {
      id: 'ask',
      label: 'Ask Book',
      icon: MessageSquareQuote,
      desc: 'Grounded RAG Q&A',
      highlight: true,
    },
    {
      id: 'takeaways',
      label: 'Key Takeaways',
      icon: Sparkles,
      desc: 'Top 10 core concepts',
    },
    {
      id: 'explorer',
      label: 'Book Explorer',
      icon: Compass,
      desc: 'Full-text & chunk search',
    },
  ];

  return (
    <aside id="bookwise-sidebar" className="w-full md:w-64 shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl p-4 text-slate-200">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Book Navigator
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                      : item.highlight
                      ? 'bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <div className="text-left">
                      <div className="leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-200" />}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Current Book Metadata Card */}
        {currentBook && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Book
              </span>
              {currentBook.isDemo && (
                <span className="rounded bg-amber-950/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                  Demo
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                {currentBook.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentBook.author || 'Author not detected'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  <strong className="text-white">{currentBook.pageCount}</strong> Pages
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  <strong className="text-white">{currentBook.chunks.length}</strong> Chunks
                </span>
              </div>
            </div>

            <motion.button
              id="sidebar-switch-book-btn"
              onClick={onOpenUpload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="h-3 w-3 text-indigo-400" />
              <span>Change / Re-upload Book</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Citation-Grounded RAG</p>
        <p className="text-[10px] leading-relaxed">
          Every answer tracks exact PDF page numbers and chapter metadata.
        </p>
      </div>
    </aside>
  );
};
