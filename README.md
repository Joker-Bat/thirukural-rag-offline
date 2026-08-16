<div align="center">

![திருக்குறள் வழிகாட்டி - Thirukkural AI Guide](public/brand-banner.jpg)

# திருக்குறள் வழிகாட்டி (Thirukkural Situational Guide)
### 100% Offline, Privacy-First, On-Device AI Semantic Search for Thirukkural

[![React Version](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.0.0-green?style=flat-square&logo=nodedotjs)](.nvmrc)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Transformers.js](https://img.shields.io/badge/%F0%9F%A4%97%20Transformers.js-v3.3-yellow?style=flat-square)](https://huggingface.co/docs/transformers.js)
[![HuggingFace Model](https://img.shields.io/badge/%F0%9F%A4%97%20Model-MiniLM--L12--v2-orange?style=flat-square)](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2)
[![PWA](https://img.shields.io/badge/PWA-100%25%20Offline-emerald?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**திருக்குறள் வழிகாட்டி (Thirukkural Guide)** is a state-of-the-art, privacy-preserving semantic retrieval system that matches real-world situations, emotional dilemmas, and moral questions to relevant couplets from the **1,330 Thirukkurals**.

Instead of relying on rigid keyword search or remote cloud LLM APIs, this application performs **100% of its neural embedding generation and vector search directly inside the user's browser** using WebAssembly (WASM), WebGPU, and precomputed dense vector indices.

### Why This Matters:
- 🔒 **Zero Data Leakage**: Your thoughts, questions, and dilemmas never leave your device.
- ⚡ **Sub-Millisecond Inference**: Computes cosine similarity across all 1,330 vectors in **$< 2\text{ ms}$**.
- 📴 **100% Offline Capability**: Once the lightweight neural model (~25MB) is cached on the first visit, the entire app functions indefinitely without an active internet connection.
- 📚 **Comprehensive Classical Literature**: Every result includes the full classical couplet in traditional Tamil meter, 3 classical commentaries (*Mu. Varadarajan, Solomon Pappaiah, Kalaignar Karunanidhi*), and 21st-century modern English translations.

---

## 🔗 Multi-Source Dataset Integration & Attribution

To bridge the gap between ancient literary poetic meter and contemporary everyday human queries, our data pipeline merges and cross-references two authoritative open-source repositories:

```mermaid
flowchart LR
    subgraph S1 ["Source 1: Classical Tamil Corpus (tk120404)"]
        A1["1,330 Couplets"]
        A2["3 Classical Commentaries (Mu. Va, Solomon Pappaiah, Karunanidhi)"]
        A3["Paal, Iyal, & Athikaram Hierarchies"]
    end

    subgraph S2 ["Source 2: Modern English Corpus (jjasim)"]
        B1["21st-Century Direct English Interpretations"]
        B2["Conversational Vocabulary Alignment"]
    end

    subgraph Unified ["Unified Corpus & Embedding Pipeline"]
        C["scripts/prepare-data.py"]
        D["public/kurals.json (Enriched Corpus)"]
        E["public/kural-embeddings.bin (384-d Dense Index)"]
    end

    S1 --> C
    S2 --> C
    C --> D
    C --> E
```

### Primary Data Sources & Citations:
1. **Classical Tamil Corpus & Commentaries**:  
   [Thirukkural JSON Database (`tk120404/thirukkural`)](https://github.com/tk120404/thirukkural)  
   - Provides all 1,330 verses in classical Tamil meter with full hierarchical categorization (*பால், இயல், அதிகாரம்*).
   - Contains 3 scholarly Tamil commentaries:
     - **மு. வரதராசனார் உரை** (Dr. Mu. Varadarajan) — Authoritative scholarly commentary.
     - **சாலமன் பாப்பையா உரை** (Solomon Pappaiah) — Accessible conversational Tamil commentary.
     - **கலைஞர் மு. கருணாநிதி உரை** (Kalaignar M. Karunanidhi) — Poetic prose commentary.

2. **21st-Century Modern English Translation Corpus**:  
   [Thirukkural English Translation Dataset (`jjasim/Thirukkural-English-Translation-Dataset`)](https://github.com/jjasim/Thirukkural-English-Translation-Dataset)  
   - Contributes clean, punchy, contemporary English interpretations (`modern_en`) for all 1,330 couplets.
   - Replaces archaic 19th-century Victorian vocabulary with active modern terms, dramatically improving cross-lingual vector alignment for modern search queries.

3. **Neural Embedding Engine**:  
   [`Xenova/paraphrase-multilingual-MiniLM-L12-v2`](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2) via [Transformers.js (`@huggingface/transformers`)](https://github.com/huggingface/transformers.js)  
   - High-speed 384-dimensional cross-lingual sentence embedding model running in-browser via WebAssembly / WebGPU.

---

## 🏛️ Architecture & System Design

The project is built on **SOLID principles**, strict separation of concerns, and an **Abstraction / Interface Pattern** for Dependency Injection. The data sources, embedding models, vector indices, and UI components are completely decoupled.

```mermaid
flowchart TD
    subgraph UI ["Client UI Layer (React 19)"]
        A[User Situational Query] --> B[SearchBox Component]
        B --> C[KuralRetrievalService]
        G[KuralCardList] --> H[Render 2-Line Couplet & 3 Classical Urais]
    end

    subgraph Worker ["Web Worker (Isolated Background Thread)"]
        D[WorkerEmbeddingService] --> E["Transformers.js (MiniLM-L12-v2 ONNX)"]
        E -->|384-d L2 Normalized Vector| F[Vector Output]
    end

    subgraph Storage ["On-Device Storage & Precomputed Assets"]
        I["kural-embeddings.bin (2.04 MB Float32Array)"]
        J["kurals.json (3.05 MB Corpus)"]
        K["Browser Cache / IndexedDB (Model Weights ~25MB)"]
    end

    C -->|Dispatch Async Query| D
    F -->|Dot Product Search <2ms| L[FlatBinaryCosineVectorIndex]
    I --> L
    J --> C
    L -->|Top K Candidates + Confidence Score| C
    C --> G
```

---

## ✨ Key Features

1. **On-Device Neural Semantic Search**:
   - Embeds user queries using a quantized multilingual sentence transformer model ([`Xenova/paraphrase-multilingual-MiniLM-L12-v2`](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2)).
   - Cross-lingual semantic alignment supports **Tamil, English, and Tanglish** queries.

2. **Precomputed Dense Binary Vector Index**:
   - All 1,330 Kurals are pre-vectorized into a contiguous 384-dimensional binary buffer (`kural-embeddings.bin`, exactly `2,042,880` bytes).
   - In-browser cosine dot-product search executes in under **2 milliseconds**.

3. **Strict Classical 2-Line Couplet Typography**:
   - Character-aware dynamic CSS Container Queries (`cqi`) mathematically scale the font size so that **Line 1 (4 words)** and **Line 2 (3 words)** are guaranteed to fit on strictly two left-aligned lines with **zero overflow, zero wrapping, and zero horizontal scrolling** across all screen sizes (320px to 4K).

4. **3 Classical Tamil Commentaries + 21st-Century Modern English Translation**:
   - **மு. வரதராசனார் உரை** (Mu. Varadarajan) — Primary commentary
   - **சாலமன் பாப்பையா உரை** (Solomon Pappaiah) — Conversational commentary
   - **கலைஞர் மு. கருணாநிதி உரை** (M. Karunanidhi) — Poetic prose commentary
   - **Modern English Interpretation** + Classical explanation.

5. **Audio Speech Synthesis**:
   - Integrated Web Speech API for Tamil voice recitation of couplets and commentaries.

6. **Progressive Web App (PWA)**:
   - Installable on iOS (Safari), Android (Chrome), and Desktop.
   - Workbox service worker precaches all assets for offline reliability.

---

## 🛠️ Technology Stack

| Domain | Technology | Version / Specification | Resource Link |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `19.2.8` | [react.dev](https://react.dev/) |
| **Language** | TypeScript | `5.7+` | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Runtime Environment** | Node.js | `>=24.0.0` (Enforced via `.nvmrc`) | [nodejs.org](https://nodejs.org/) |
| **Build Tool & Dev Server** | Vite | `6.4+` | [vitejs.dev](https://vitejs.dev/) |
| **State Management** | Zustand | `5.0+` | [zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs/) |
| **Styling & Design System** | Tailwind CSS / Vanilla CSS | Tailwind CSS v4 | [tailwindcss.com](https://tailwindcss.com/) |
| **On-Device AI Engine** | Transformers.js (ONNX Runtime) | `@huggingface/transformers ^3.3.3` | [Transformers.js GitHub](https://github.com/huggingface/transformers.js) |
| **Embedding Model** | Multilingual MiniLM-L12-v2 | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | [HuggingFace Model Card](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2) |
| **Tamil Corpus Dataset** | Thirukkural JSON Database | 1,330 Kurals with 3 Urais | [tk120404/thirukkural](https://github.com/tk120404/thirukkural) |
| **Modern English Dataset** | Thirukkural Modern English | 1,330 Modern Interpretations | [jjasim/Thirukkural-English-Translation-Dataset](https://github.com/jjasim/Thirukkural-English-Translation-Dataset) |
| **PWA & Offline** | Vite Plugin PWA (Workbox) | `vite-plugin-pwa ^0.21.2` | [vite-pwa-org](https://vite-pwa-org.netlify.app/) |
| **Icons & Audio** | Lucide React / Web Speech API | `lucide-react`, Native Browser SpeechSynthesis | [lucide.dev](https://lucide.dev/) |
| **Data Ingestion Pipeline** | Python / uv | Python 3.12, `sentence-transformers`, `numpy` | [Sentence-Transformers](https://github.com/UKPLab/sentence-transformers) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v24.0.0` or higher (enforced via `.nvmrc`)
- **npm** or **pnpm** or **yarn**
- *(Optional for data pipeline)*: **Python 3.10+** and **uv**

---

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Joker-Bat/thirukural-rag-offline.git
   cd thirukural-rag-offline
   ```

2. **Ensure Node 24 is active**:
   ```bash
   nvm use
   ```

3. **Install frontend dependencies**:
   ```bash
   npm install
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

### Production Build & Preview

To build the production-ready PWA bundle with optimized chunks:

```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🐍 Data Ingestion Pipeline

The precomputed embeddings (`public/kural-embeddings.bin`) and merged corpus (`public/kurals.json`) are generated automatically by `scripts/prepare-data.py`.

To re-run the multi-source dataset merger and compute vector embeddings locally:

```bash
uv run --with numpy --with sentence-transformers --with requests python scripts/prepare-data.py
```

---

## 📂 Project Structure

```text
thirukural-rag-offline/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── brand-banner.jpg          # High-resolution brand identity banner
│   ├── favicon.svg               # Classical terracotta logo
│   ├── kurals.json               # Merged 1,330 Kurals with 3 commentaries & modern English
│   └── kural-embeddings.bin      # Precomputed 1330x384 Float32 binary dense index
├── scripts/
│   ├── prepare-data.py           # Multi-source dataset merger & vector pipeline
│   └── test-retrieval.py         # Automated semantic benchmark tests
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable atomic UI components (Button, Badge, Card, Progress, Accordion)
│   │   ├── empty-fallback.tsx    # Low confidence / no results fallback
│   │   ├── header.tsx            # Sticky header with offline status pill
│   │   ├── kural-card.tsx        # Couplet cards with 2-line CQI fluid typography, modern English & commentaries
│   │   ├── model-download-modal.tsx # On-device model onboarding & live progress dialog
│   │   └── search-box.tsx        # Semantic search textarea & horizontal scroll situation presets
│   ├── context/
│   │   └── service-context.tsx   # React Dependency Injection provider
│   ├── services/
│   │   ├── interfaces/           # Core SOLID abstraction contracts
│   │   │   ├── data-source.interface.ts
│   │   │   ├── embedding-service.interface.ts
│   │   │   ├── retrieval-service.interface.ts
│   │   │   ├── speech-service.interface.ts
│   │   │   └── vector-index.interface.ts
│   │   ├── container.ts          # Dependency Injection service registry
│   │   ├── flat-binary-cosine-vector-index.ts # In-browser dot-product vector search
│   │   ├── kural-retrieval-service.ts         # Orchestrator for retrieval pipeline
│   │   ├── static-json-kural-data-source.ts   # Kural corpus loader
│   │   ├── web-speech-service.ts              # Tamil audio synthesis
│   │   └── worker-embedding-service.ts        # Web Worker communication manager
│   ├── stores/
│   │   └── use-kural-store.ts    # Zustand state store with LocalStorage persistence
│   ├── types/
│   │   ├── kural.ts              # Domain entities, commentary schemas, search types
│   │   └── worker-messages.ts    # Web Worker message protocols
│   ├── app.tsx                   # Main editorial app shell & layout
│   ├── index.css                 # Classical parchment design tokens & ambient gradients
│   ├── main.tsx                  # Application bootstrap & PWA registration
│   ├── vite-env.d.ts             # Vite client environment types
│   └── worker.ts                 # Transformers.js Web Worker feature extraction pipeline
├── .nvmrc                        # Node 24 environment declaration
├── LICENSE                       # MIT License
├── package.json                  # Dependencies & Node >=24 engine declaration
├── tsconfig.json
├── vite.config.ts                # Vite config with GitHub Pages base path & PWA Workbox
└── README.md                     # Comprehensive documentation & architectural manual
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**கற்க கசடறக் கற்பவை கற்றபின்**<br>
**நிற்க அதற்குத் தக.** (குறள் 391)

*Crafted with respect for Classical Tamil Literature & Modern Web Engineering.*

</div>
