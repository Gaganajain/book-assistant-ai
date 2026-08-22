import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, UploadCloud, Library, Search, Bot, Layers } from 'lucide-react';
import { BookData } from '../types';
import { AssistantOrb3D } from './3d';

interface NavbarProps {
  currentBook: BookData | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenDemo: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBook,
  activeTab,
  onSelectTab,
  onOpenUpload,
  onOpenDemo,
  hasApiKey,
}) => {
  return (
    <header id="bookwise-navbar" className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl text-slate-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-btn"
            onClick={() => onSelectTab(currentBook ? 'overview' : 'landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <div className="relative">
                <BookOpen className="h-5 w-5" />
                <Sparkles className="absolute -top-1.5 -right-1.5 h-3 w-3 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">BookWise</span>
                <span className="rounded-md bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                  3D RAG
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Intelligent Book Assistant</p>
            </div>
          </button>

          {/* Active Book Pill */}
          {currentBook && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="max-w-[240px] truncate text-xs font-semibold text-slate-200">
                {currentBook.title}
              </div>
              {currentBook.isDemo && (
                <span className="rounded-full bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  Demo Book
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentBook ? (
            <>
              <button
                id="nav-search-btn"
                onClick={() => onSelectTab('explorer')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search Book</span>
              </button>

              <button
                id="nav-ask-btn"
                onClick={() => onSelectTab('ask')}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30 border border-indigo-400/30 cursor-pointer"
              >
                <Bot className="h-4 w-4 text-indigo-200" />
                <span>Ask Book</span>
              </button>

              <button
                id="nav-upload-new-btn"
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                <UploadCloud className="h-4 w-4 text-slate-400" />
                <span className="hidden sm:inline">Upload New</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-try-demo-btn"
                onClick={onOpenDemo}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors shadow-xs cursor-pointer"
              >
                <Library className="h-4 w-4 text-indigo-400" />
                <span>Try Demo</span>
              </button>

              <button
                id="nav-upload-book-btn"
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/30 border border-indigo-400/30 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload a Book</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
