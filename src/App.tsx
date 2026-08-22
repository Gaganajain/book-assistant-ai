import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BookUpload } from './components/BookUpload';
import { SourceViewerModal } from './components/SourceViewerModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { ChaptersPage } from './pages/ChaptersPage';
import { ChapterDetailPage } from './pages/ChapterDetailPage';
import { AskBookPage } from './pages/AskBookPage';
import { KeyTakeawaysPage } from './pages/KeyTakeawaysPage';
import { BookExplorerPage } from './pages/BookExplorerPage';
import { DEMO_BOOK } from './data/demoBook';
import { BookData, CitationSource } from './types';
import { checkServerHealth } from './services/geminiService';

export default function App() {
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<CitationSource | null>(null);
  const [isSourceViewerOpen, setIsSourceViewerOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth().then((res) => {
      setHasApiKey(res.hasApiKey);
    });
  }, []);

  const handleLoadDemo = () => {
    setCurrentBook(DEMO_BOOK);
    setActiveTab('overview');
  };

  const handleBookLoaded = (book: BookData) => {
    setCurrentBook(book);
    setIsUploadOpen(false);
    setActiveTab('overview');
  };

  const handleOpenSourceViewer = (source: CitationSource) => {
    setActiveSource(source);
    setIsSourceViewerOpen(true);
  };

  const handleNavigateToChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveTab('chapter-detail');
  };

  const handleAskAboutChapter = (chapterTitle: string) => {
    setChatInitialQuery(`Explain the main ideas and evidence in ${chapterTitle}`);
    setActiveTab('ask');
  };

  const handleAskAboutConcept = (concept: string) => {
    setChatInitialQuery(`Explain the concept of ${concept} and where it is discussed in this book.`);
    setActiveTab('ask');
  };

  // Find active chapter object if in chapter-detail view
  const activeChapter = currentBook?.chapters.find(
    (c) => c.id === selectedChapterId || c.title === selectedChapterId
  ) || currentBook?.chapters[0];

  return (
    <div id="bookwise-app-root" className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        currentBook={currentBook}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'landing') {
            setActiveTab('landing');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenDemo={handleLoadDemo}
        hasApiKey={hasApiKey}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        {currentBook && activeTab !== 'landing' ? (
          <>
            {/* Left Sidebar */}
            <Sidebar
              currentBook={currentBook}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                if (tab === 'chapters') {
                  setSelectedChapterId(null);
                }
                setActiveTab(tab);
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
            />

            {/* Main Content Area */}
            <main id="bookwise-main-content" className="flex-1 min-w-0 bg-[#0B0F19] overflow-y-auto">
              {activeTab === 'overview' && (
                <DashboardOverview
                  book={currentBook}
                  onNavigate={(tab, chId) => {
                    if (chId) {
                      handleNavigateToChapter(chId);
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                  onOpenSourceViewer={handleOpenSourceViewer}
                />
              )}

              {activeTab === 'chapters' && (
                <ChaptersPage
                  book={currentBook}
                  onSelectChapter={handleNavigateToChapter}
                />
              )}

              {activeTab === 'chapter-detail' && activeChapter && (
                <ChapterDetailPage
                  book={currentBook}
                  chapter={activeChapter}
                  onBack={() => setActiveTab('chapters')}
                  onAskAboutChapter={handleAskAboutChapter}
                  onOpenSourceViewer={handleOpenSourceViewer}
                />
              )}

              {activeTab === 'ask' && (
                <AskBookPage
                  key={`${currentBook.id}-${chatInitialQuery || 'default'}`}
                  book={currentBook}
                  initialQuery={chatInitialQuery}
                  onOpenSourceViewer={handleOpenSourceViewer}
                />
              )}

              {activeTab === 'takeaways' && (
                <KeyTakeawaysPage
                  book={currentBook}
                  onOpenSourceViewer={handleOpenSourceViewer}
                  onAskAboutConcept={handleAskAboutConcept}
                />
              )}

              {activeTab === 'explorer' && (
                <BookExplorerPage
                  book={currentBook}
                  onOpenSourceViewer={handleOpenSourceViewer}
                  onAskAboutResult={(text) => {
                    setChatInitialQuery(text);
                    setActiveTab('ask');
                  }}
                />
              )}
            </main>
          </>
        ) : (
          /* Landing Page */
          <main className="w-full">
            <LandingPage
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenDemo={handleLoadDemo}
            />
          </main>
        )}
      </div>

      {/* Book Upload Modal */}
      <BookUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onBookLoaded={handleBookLoaded}
        onLoadDemo={handleLoadDemo}
      />

      {/* Source Viewer Modal */}
      <SourceViewerModal
        isOpen={isSourceViewerOpen}
        onClose={() => setIsSourceViewerOpen(false)}
        source={activeSource}
        allChunks={currentBook?.chunks || []}
        onSelectChunk={(chunk) => {
          setActiveSource({
            chunkId: chunk.id,
            chapter: chunk.chapterTitle,
            page: chunk.pageNumber,
            excerpt: chunk.text,
          });
        }}
      />
    </div>
  );
}
