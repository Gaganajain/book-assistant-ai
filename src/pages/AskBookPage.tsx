import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Loader2,
  Bookmark,
} from 'lucide-react';
import { BookData, ChatMessage, CitationSource } from '../types';
import { retrieveRelevantChunks } from '../services/retrievalService';
import { queryRAGAssistant } from '../services/geminiService';
import { TypingIndicator, AnimatedGroup } from '../components/motion-primitives';
import { AssistantOrb3D, Card3DTilt } from '../components/3d';

interface AskBookPageProps {
  book: BookData;
  initialQuery?: string;
  onOpenSourceViewer: (source: CitationSource) => void;
}

const EXAMPLE_QUESTIONS = [
  'What is the main argument of the book?',
  'Explain Chapter 3 in simple terms.',
  'What does the author mean by confirmation bias?',
  'Compare the ideas in Chapter 2 and Chapter 5.',
  'What examples does the author give?',
  'What are the five most important concepts in this book?',
  'Where does the author discuss the bat and ball problem?',
];

export const AskBookPage: React.FC<AskBookPageProps> = ({
  book,
  initialQuery,
  onOpenSourceViewer,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hello! I am **BookWise**, your intelligent book assistant for ***${book.title}***.\n\nEvery answer I give is strictly grounded in the physical pages of your uploaded book and accompanied by verifiable citations with PDF page numbers.\n\nAsk me anything about concepts, chapters, case studies, or author arguments.`,
        suggestedFollowUps: [
          'What is the central thesis of this book?',
          'What are the key takeaways from Chapter 1?',
          'Where does the author discuss heuristics?'
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, []);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue.trim();
    if (!textToSend || isLoading) return;

    setInputValue('');
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. RAG Retrieval from local indexed chunks
      const retrievedChunks = retrieveRelevantChunks(textToSend, book.chunks, {
        topK: 5,
        chapterFilter: chapterFilter === 'all' ? undefined : chapterFilter,
      });

      // 2. Format conversation history
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      // 3. Query server-side Gemini RAG with strict grounding
      const response = await queryRAGAssistant({
        query: textToSend,
        bookTitle: book.title,
        bookAuthor: book.author,
        chunks: retrievedChunks,
        conversationHistory: history,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        suggestedFollowUps: response.suggestedFollowUps || [],
        isInsufficientEvidence: response.isInsufficientEvidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue processing your request: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Chat cleared. Ask me anything about ***${book.title}***!`,
        suggestedFollowUps: [
          'What is the central thesis of this book?',
          'What are the key takeaways from Chapter 1?',
          'Where does the author discuss heuristics?'
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div id="ask-book-page" className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-3 sm:p-6 text-slate-100">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <AssistantOrb3D state={isLoading ? 'thinking' : 'idle'} className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>Ask Your Book</span>
              </h1>
              <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Grounded 3D RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              Querying: <span className="font-semibold text-slate-200">{book.title}</span> ({book.pageCount} pages)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Chapter Filter */}
          <select
            id="ask-chapter-filter-select"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-xs hover:border-slate-600 focus:outline-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Chapters</option>
            {book.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch {ch.chapterNumber}: {ch.title.slice(0, 24)}...
              </option>
            ))}
          </select>

          <button
            id="clear-chat-btn"
            onClick={handleClearChat}
            title="Clear Chat"
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Chat Messages Container */}
      <div id="chat-messages-scroll-area" className="flex-1 overflow-y-auto space-y-5 px-1 sm:px-2 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                id={`message-${msg.id}`}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div
                  className={`flex gap-3 max-w-3xl ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {isUser ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-200 border border-slate-700 shadow-md">
                        <User className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <AssistantOrb3D state={isLoading ? 'thinking' : 'idle'} className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4.5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xl ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-xs border border-indigo-400/30'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs backdrop-blur-md'
                    }`}
                  >
                    {/* Markdown Content */}
                    <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'text-slate-200'}`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* Insufficient Evidence Guidance */}
                    {msg.isInsufficientEvidence && (
                      <div className="mt-3 rounded-xl bg-amber-950/50 border border-amber-500/30 p-3 text-xs text-amber-300 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                          <span>Try asking about:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/80">
                          <li>A specific chapter or section from the book</li>
                          <li>A core concept (e.g. System 1 vs 2, heuristics, anchoring)</li>
                          <li>An author argument or experimental example</li>
                        </ul>
                      </div>
                    )}

                    {/* Sources Section */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Grounded Sources ({msg.sources.length})</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          {msg.sources.map((src, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={{ y: -1 }}
                              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1.5 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 font-semibold text-white">
                                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                                  <span>{src.chapter}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => onOpenSourceViewer(src)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-950/90 border border-indigo-500/40 px-2.5 py-1 text-[10px] font-bold text-indigo-300 hover:bg-indigo-900/90 hover:text-white transition-colors cursor-pointer shadow-xs"
                                >
                                  <span>[Chapter • p.{src.page}] View in Book</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </motion.button>
                              </div>

                              {/* Excerpt quote */}
                              <blockquote className="border-l-2 border-indigo-500 pl-2.5 text-[11px] italic text-slate-300 line-clamp-2">
                                "{src.excerpt}"
                              </blockquote>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Bottom Toolbar */}
                    {!isUser && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Follow-up Questions */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pl-11 space-y-1.5 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Suggested Follow-ups
                    </span>
                    <AnimatedGroup
                      preset="scale"
                      stagger={0.05}
                      className="flex flex-wrap gap-1.5"
                    >
                      {msg.suggestedFollowUps.map((q, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSend(q)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/60 hover:text-indigo-200 transition-all shadow-xs text-left cursor-pointer"
                        >
                          <span className="text-indigo-400">→</span>
                          <span>{q}</span>
                        </motion.button>
                      ))}
                    </AnimatedGroup>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Indicator with TypingIndicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 pl-1"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <AssistantOrb3D state="thinking" className="w-8 h-8" />
            </div>
            <div className="rounded-2xl rounded-tl-xs border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs text-slate-300 shadow-xl flex items-center gap-3">
              <TypingIndicator />
              <span>Retrieving page chunks and formulating grounded answer...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts pills (shown when chat is short) */}
      {messages.length <= 2 && !isLoading && (
        <div className="py-2 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Example Questions:
          </span>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            {EXAMPLE_QUESTIONS.map((eq, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(eq)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-indigo-950/60 hover:text-indigo-200 hover:border-indigo-500/40 transition-colors cursor-pointer"
              >
                {eq}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="mt-2 pt-2 border-t border-slate-800">
        <div className="relative flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 shadow-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1.5">
          <textarea
            ref={textareaRef}
            id="ask-book-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask anything about this book... (e.g., 'What is loss aversion in Chapter 3?')"
            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none max-h-32"
          />

          <motion.button
            id="send-question-btn"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            whileHover={inputValue.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={inputValue.trim() && !isLoading ? { scale: 0.95 } : {}}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white disabled:opacity-30 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Strict Hallucination Filter Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};
