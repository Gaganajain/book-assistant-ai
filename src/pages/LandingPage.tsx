import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  UploadCloud,
  Library,
  Layers,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Search,
  FileText,
  Compass,
  Cpu,
} from 'lucide-react';
import {
  TextEffect,
  Spotlight,
  Magnetic,
  InView,
  AnimatedGroup,
} from '../components/motion-primitives';
import { Hero3DScene, Card3DTilt, UploadBook3D } from '../components/3d';

interface LandingPageProps {
  onOpenUpload: () => void;
  onOpenDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenUpload,
  onOpenDemo,
}) => {
  const featureCards = [
    {
      id: 'feature-chapter-intel',
      title: 'Chapter Intelligence',
      desc: 'Automatically organize and summarize your book chapter by chapter with core ideas and concept breakdowns.',
      icon: Layers,
      color: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'feature-ask-book',
      title: 'Ask Your Book',
      desc: 'Ask questions in natural language and get answers grounded strictly in the uploaded content without hallucinations.',
      icon: MessageSquareQuote,
      color: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'feature-source-backed',
      title: 'Source-Backed Answers',
      desc: 'Every answer shows where the information came from, with exact chapter names, PDF page citations, and verifiable quotes.',
      icon: ShieldCheck,
      color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'feature-smart-revision',
      title: 'Smart Revision',
      desc: 'Turn dense chapters into concise revision notes, important evidence lists, and top key takeaways for rapid study.',
      icon: Sparkles,
      color: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div
      id="landing-page-container"
      className="min-h-[calc(100vh-4rem)] bg-[#0B0F19] text-slate-100 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-2/3 -right-40 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl rounded-full" />

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-300 shadow-lg shadow-indigo-500/10 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Interactive 3D Citation-Grounded RAG</span>
        </motion.div>

        {/* 3D Floating Book Hero Scene */}
        <div className="relative my-2">
          <Hero3DScene className="max-w-3xl mx-auto" />

          {/* Floating Subtle Headline over Hero Canvas */}
          <div className="relative -mt-10 sm:-mt-14 z-20 space-y-2 pointer-events-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-serif drop-shadow-md">
              <TextEffect per="char" preset="fade" delay={0.1}>
                BOOKWISE
              </TextEffect>
            </h1>

            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              <TextEffect per="word" preset="slide" delay={0.25}>
                Your books. Your questions. Verified answers.
              </TextEffect>
            </div>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed font-normal"
            >
              Upload any PDF book or study guide. Explore structured chapter summaries, ask complex questions, and inspect exact physical PDF citations in seconds.
            </motion.p>
          </div>
        </div>

        {/* CTA Buttons with Magnetic & Smooth Spring Transitions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-20"
        >
          <Magnetic intensity={0.2}>
            <motion.button
              id="hero-upload-book-btn"
              onClick={onOpenUpload}
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
            >
              <UploadCloud className="h-5 w-5 text-indigo-100" />
              <span>Upload Your Book (PDF)</span>
            </motion.button>
          </Magnetic>

          <Magnetic intensity={0.15}>
            <motion.button
              id="hero-try-demo-btn"
              onClick={onOpenDemo}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-slate-200 shadow-md hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
            >
              <Library className="h-5 w-5 text-indigo-400" />
              <span>Explore Demo Book</span>
            </motion.button>
          </Magnetic>
        </motion.div>

        {/* Trust Points Staggered Reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400"
        >
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Physical PDF Page Citations</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strict Hallucination Prevention</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Source Text Inspector</span>
          </div>
        </motion.div>

        {/* 3D Interactive Upload Card Preview */}
        <InView
          as="div"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="mt-12"
        >
          <Card3DTilt maxTilt={4} glareOpacity={0.12} scaleOnHover={1.01}>
            <div
              onClick={onOpenUpload}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-indigo-500/50 text-center"
            >
              <Spotlight fill="rgba(99, 102, 241, 0.15)" size={400} />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                    <UploadBook3D className="w-20 h-20" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Drag and drop your PDF book here to begin analysis
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Extracts chapters, maps physical PDF page coordinates, and builds a grounded citation engine.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-900/80 transition-colors shadow-sm">
                  <span>Select a PDF document</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Card3DTilt>
        </InView>

        {/* Product Principle Visual Callout: UNDERSTAND -> ASK -> VERIFY */}
        <InView
          as="div"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
          }}
          className="mt-12 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-xl relative overflow-hidden"
        >
          <Spotlight fill="rgba(79, 70, 229, 0.1)" size={350} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>The BookWise Product Principle</span>
          </h2>
          <AnimatedGroup
            preset="slide"
            stagger={0.1}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
          >
            <Card3DTilt maxTilt={5} glareOpacity={0.1}>
              <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/60 transition-all hover:border-indigo-500/40 h-full">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/40 text-xs font-bold">1</span>
                  <span>UNDERSTAND</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Automated chapter detection, core ideas synthesis, and structured chapter summaries.
                </p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={5} glareOpacity={0.1}>
              <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/60 transition-all hover:border-indigo-500/40 h-full">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/40 text-xs font-bold">2</span>
                  <span>ASK</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Query in natural language. Semantic vector search retrieves top relevant book excerpts.
                </p>
              </div>
            </Card3DTilt>

            <Card3DTilt maxTilt={5} glareOpacity={0.1}>
              <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/60 transition-all hover:border-indigo-500/40 h-full">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/40 text-xs font-bold">3</span>
                  <span>VERIFY</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Inspect the original PDF text with exact page number and chapter badges for every factual claim.
                </p>
              </div>
            </Card3DTilt>
          </AnimatedGroup>
        </InView>

        {/* Feature Cards Grid with 3D Tilt & Staggered Scroll Reveal */}
        <InView
          as="div"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
          }}
          className="mt-12 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Key Capabilities</h3>
            <span className="text-xs text-slate-400">Engineered for deep study & revision</span>
          </div>

          <AnimatedGroup
            preset="slide"
            stagger={0.08}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card3DTilt key={card.id} id={card.id} maxTilt={6} glareOpacity={0.12}>
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-lg transition-all duration-300 hover:border-indigo-500/40 h-full">
                    <Spotlight fill="rgba(99, 102, 241, 0.1)" size={280} />
                    <div className="relative z-10">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border mb-3.5 ${card.color} transition-transform group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{card.title}</h4>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-normal">{card.desc}</p>
                    </div>
                  </div>
                </Card3DTilt>
              );
            })}
          </AnimatedGroup>
        </InView>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-400 relative z-10">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>BookWise</span>
            <span className="font-normal text-slate-500">— Grounded AI Book Assistant</span>
          </div>
          <p className="text-slate-400">
            Every factual answer grounded in the uploaded book and accompanied by a citation.
          </p>
        </div>
      </footer>
    </div>
  );
};
