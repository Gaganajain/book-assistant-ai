<div align="center">

# 📚 BookWise — Intelligent Book Assistant

**Your books. Your questions. Verified answers.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-RAG-4285F4?logo=googlegemini&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

</div>

BookWise is an AI-powered, citation-focused RAG book assistant that allows users to upload a full-length PDF book and interact with it through verified, chapter-by-chapter intelligence and grounded answers.

---

## 1. Problem

Readers, researchers, and students spend hours searching through dense textbooks and non-fiction books to find important concepts, understand chapter progressions, revise material, and locate the original source of an answer. Traditional chatbots often hallucinate or answer from generic knowledge without specifying where in the book a claim is made.

---

## 2. Solution

BookWise transforms book reading into an interactive, verifiable research experience:
1. **Physical Page Integrity**: Preserves exact 1-indexed PDF page numbers throughout extraction, chunking, and retrieval.
2. **Grounded RAG Pipeline**: Restricts model responses to retrieved book chunks, refusing to answer when sufficient evidence is missing.
3. **Interactive Citations**: Every answer provides clickable source badges `[Chapter X • p.Y]` that open a source inspector displaying the original text.
4. **Chapter Intelligence & Smart Revision**: Automatically extracts chapter hierarchies, structured summaries, and top 10 revision key takeaways.

---

## 3. Major Features

- **Drag-and-Drop PDF Upload**: Process books up to 80MB with a 7-stage visual pipeline.
- **Chapter Browser & Detail Summaries**: What the chapter is about, core ideas with page numbers, important concepts, key takeaways, and revision flashcards.
- **Ask Your Book (RAG Chat)**: Real-time grounded question answering with inline citation badges and contextual follow-up prompts.
- **Source Text Inspector**: Inspect the exact extracted text from any page with one click.
- **Top 10 Key Takeaways**: High-yield concepts formatted for fast revision and exam preparation.
- **Book Explorer & Full-Text Search**: Search for terms across all pages and chapters with instant relevance scoring.
- **Interactive Demo Mode**: Explore cognitive psychology sample book *"Thinking & Deciding: Foundations of Cognitive Rationality"* by Dr. Eleanor Vance.

---

## 4. Architecture

```
PDF Upload
    ↓
Text Extraction (pdfjs-dist, preserving PDF page numbers)
    ↓
Chapter Detection (TOC, regex patterns & page ranges)
    ↓
Contextual Chunking (with overlap, page & chapter metadata)
    ↓
Hybrid Retrieval Layer (Semantic Embeddings + TF-IDF / BM25)
    ↓
Gemini 3.7 Flash Model (Strict Grounding System Prompt)
    ↓
Grounded Answer + Page-Level Citations + Source Inspector
```

---

## 5. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion, React Markdown
- **AI & RAG Engine**: Google Gemini API (`@google/genai` SDK with `gemini-3.7-flash`), Gemini Embedding Engine
- **PDF Extraction**: `pdfjs-dist` (client-side extraction maintaining 100% page parity)
- **Backend Server**: Express.js with Vite Middleware for full-stack API key security

---

## 6. Setup and Local Development

### Prerequisites
- Node.js 18+
- Gemini API Key (configured in AI Studio Secrets or `.env`)

### Installation
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Add GEMINI_API_KEY="your_api_key_here"

# 3. Start development server
npm run dev
```

The app will start at `http://localhost:3000`.

---

## 7. RAG Pipeline & Citation System

### Chunk Metadata Structure
```json
{
  "id": "book1_chunk_42",
  "bookId": "book1",
  "chapterId": "ch-3",
  "chapterTitle": "Chapter 3: Prospect Theory and Loss Aversion",
  "pageNumber": 14,
  "text": "Losses loom roughly twice as large as equivalent gains...",
  "embedding": [...]
}
```

### Hallucination Prevention
- If retrieval confidence is low or evidence is insufficient, the assistant explicitly responds:
  *"I couldn't find enough information about this in the uploaded book."*
  along with guidance on what to ask instead.

---

## 8. Future Improvements

- OCR support for scanned/image-only PDFs
- Visual PDF canvas highlighter rendering
- Multi-book cross-comparison and synthesis
- Flashcard quiz mode & spaced repetition export
- Voice input & TTS read-aloud citations

---

## 👩‍💻 Author

**Gagana Jain A** · [GitHub](https://github.com/Gaganajain)

⭐ If you found this useful, consider giving the repo a star!
