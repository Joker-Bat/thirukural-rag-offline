markdown
# Architectural Specification & Implementation Plan: Offline Thirukkural Semantic Retrieval PWA

This document serves as the complete technical blueprint and developer specification for **Thirukkural Guide (திருக்குறள் வழிகாட்டி)**—a client-side, 100% offline-first semantic search web application designed exclusively for mobile viewports.

---

## 1. Project Overview & Architecture

The application allows users to express situational feelings, moral dilemmas, or personal difficulties in colloquial English, formal Tamil, or Tanglish, and instantly retrieves the most relevant Thirukkurals along with classical scholarly commentaries (*Urais*).

### High-Level Architecture
1. **Offline-First Retrieval:** All 1,330 Kurals and their normalized 384-dimensional dense vectors ($1330 \times 384$ floats $\approx 2.04\text{ MB}$) are precomputed during build time and shipped as static assets.
2. **In-Browser Inference:** When a user submits a query, an on-device quantized embedding model (`Xenova/paraphrase-multilingual-MiniLM-L12-v2`) vectorizes the query inside a dedicated Web Worker via `@huggingface/transformers` (WASM/WebGPU).
3. **Sub-millisecond Matching:** Cosine similarity (dot product over pre-normalized vectors) is calculated across all 1,330 Kurals directly in client-side memory using `Float32Array`.
4. **Zero Server / Zero LLM Hallucination:** The app runs completely on the user's device without a backend server or heavy generative LLM, ensuring zero hallucinations and immediate responses.

---

## 2. Directory & Monorepo Structure

```text
.
├── package.json               # Frontend dependencies (npm)
├── vite.config.ts             # Vite + PWA configuration
├── tsconfig.json              # TypeScript root config
├── tailwind.config.js         # Tailwind CSS styling tokens
├── components.json            # shadcn/ui configuration
├── public/
│   ├── favicon.ico
│   ├── kurals.json            # Generated: 1,330 Kural records + 5 Urais + English
│   └── kural_embeddings.bin   # Generated: Flat binary Float32Array (2,042,880 bytes)
├── src/
│   ├── main.tsx               # Application mount point
│   ├── App.tsx                # Main container & state coordination
│   ├── worker.ts              # Transformers.js Web Worker (feature-extraction)
│   ├── types/
│   │   └── kural.ts           # Type definitions for Kurals, results, and messages
│   ├── services/
│   │   └── kuralSearch.ts     # Binary asset loader & Cosine similarity computation
│   ├── stores/
│   │   └── useKuralStore.ts   # Zustand state management (model status, query, results)
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (button, card, dialog, progress, etc.)
│   │   ├── Header.tsx         # Mobile header with title and status indicator
│   │   ├── SearchBox.tsx      # Multi-line input + quick situation preset chips
│   │   ├── ModelDownloadModal.tsx # First-time model download dialog with progress
│   │   ├── KuralCard.tsx      # Primary & secondary Kural display cards with accordion
│   │   └── EmptyFallback.tsx  # Low-confidence / gibberish fallback state
│   └── lib/
│       └── utils.ts           # shadcn cn() class merger
└── scripts/
    ├── pyproject.toml         # Python workspace managed by uv
    ├── prepare_data.py        # Ingestion, formatting & embedding generator
    └── README.md              # Documentation on running the data generation pipeline

```

---

## 3. Technology Stack & Dependencies

### Web Application (Root - `npm`)

* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`
* **UI Components:** `shadcn/ui` (Radix Primitives)
* **Icons:** `lucide-react`
* **ML Runtime:** `@huggingface/transformers` (Transformers.js v3)
* **State Management:** `zustand`
* **PWA & Caching:** `vite-plugin-pwa`

### Build-Time Data Pipeline (`/scripts` - `uv`)

* **Environment:** Python 3.10+ managed via `uv`
* **ML Model:** `sentence-transformers` (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`)
* **Data Processing:** `numpy`, `requests`

---

## 4. Step-by-Step Implementation Instructions

### Step 4.1: Data Pipeline (`scripts/`)

#### 4.1.1 Environment Setup with `uv`

In `scripts/pyproject.toml`:

```toml
[project]
name = "kural-rag-scripts"
version = "0.1.0"
description = "Thirukkural dataset processor and vector generator"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "sentence-transformers>=3.0.0",
    "numpy>=1.24.0",
    "requests>=2.31.0"
]

```

Run in terminal:

```bash
cd scripts
uv sync

```

#### 4.1.2 Data Processing Script (`scripts/prepare_data.py`)

1. Downloads the comprehensive Thirukkural JSON dataset (`https://raw.githubusercontent.com/vijayanandrp/Thirukkural-Tamil-Dataset/master/thirukkural.json`).
2. Cleans and normalizes all 1,330 entries.
3. Constructs a rich searchable text payload per Kural to maximize cross-lingual semantic matching:

$$\text{Context} = \text{Athikaram} + \text{Verse} + \text{English Explanation} + \text{Mu.Va Urai} + \text{Pappaiah Urai}$$


4. Encodes all 1,330 payloads using `paraphrase-multilingual-MiniLM-L12-v2` with `normalize_embeddings=True`.
5. Exports:
* `public/kurals.json`: Array of 1,330 metadata objects containing `id`, `line1`, `line2`, `athikaram_ta`, `athikaram_en`, `pal_ta`, `iyal_ta`, `translation_en`, `explanation_en`, and `urais` (mapping `mu_va`, `pappaiah`, `karunanidhi`, `parimelazhagar`, `manakkudavar`).
* `public/kural_embeddings.bin`: A contiguous flat `Float32Array` binary file of dimension $1330 \times 384 = 510,720$ float values ($2,042,880$ bytes).



---

### Step 4.2: Frontend Configuration & Dependencies

#### 4.2.1 Setup & Package Installation

Initialize project at root:

```bash
npm create vite@latest . -- --template react-ts
npm install @huggingface/transformers zustand lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-progress @radix-ui/react-slot
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa @types/node
npx tailwindcss init -p

```

Configure `components.json` for shadcn/ui and generate basic UI primitives:

* `button`, `card`, `accordion`, `dialog`, `progress`, `badge`, `textarea`.

#### 4.2.2 PWA & Vite Worker Configuration (`vite.config.ts`)

* Configure `vite-plugin-pwa` with `registerType: 'autoUpdate'` to precache static assets (`kurals.json`, `kural_embeddings.bin`, and bundle chunks).
* Configure worker options: `worker: { format: 'es' }`.

---

### Step 4.3: Core Modules & Logic

#### 4.3.1 Web Worker (`src/worker.ts`)

* Initialize Transformers.js pipeline `pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2')`.
* Report download progress percentages via `progress_callback` to the main thread.
* Listen for `{ type: 'EMBED', query: string }`, perform mean-pooling + L2-normalization, and return the 384-dimensional query vector.

#### 4.3.2 Vector Search Service (`src/services/kuralSearch.ts`)

* `loadStaticData()`: Concurrently fetches `/kurals.json` and `/kural_embeddings.bin`, instantiating the cached `Float32Array`.
* `searchKurals(queryVector: number[], topK = 3)`:
* Iterates across the 1,330 vector blocks.
* Calculates the dot product between the query vector and each Kural vector:

$$\text{Score}_i = \sum_{d=0}^{383} \text{query}[d] \times \text{matrix}[i \times 384 + d]$$


* Sorts descending and returns top $K$ results with similarity scores scaled to $[0, 1]$.



#### 4.3.3 Global Store (`src/stores/useKuralStore.ts`)

Tracks:

* `modelStatus`: `'uninitialized' | 'downloading' | 'ready' | 'error'`
* `downloadProgress`: number ($0 - 100$)
* `isSearching`: boolean
* `results`: `SearchResult[]`
* `hasSearched`: boolean

---

### Step 4.4: UI Components & UX Implementation (Mobile-First)

#### 4.4.1 Model Download Dialog (`src/components/ModelDownloadModal.tsx`)

* Appears automatically if the model is not yet cached when the user attempts a search or opens the app.
* **Content:** Transparently explains what is being downloaded:
* Model Name: `paraphrase-multilingual-MiniLM-L12-v2`
* Size: $\sim 25\text{ MB}$ (one-time download, stored permanently in browser storage for 100% offline usage).
* Direct Link: `https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2`


* Shows a shadcn `Progress` bar during download and automatically closes upon completion.

#### 4.4.2 Search Box & Situation Preset Chips (`src/components/SearchBox.tsx`)

* Mobile-optimized auto-expanding textarea with clear placeholder in Tamil and English.
* **Preset Situation Chips (Tap to Search):**
1. *"Handling failure despite hard work"* (முயற்சி தோல்வி)
2. *"Betrayal by a trusted friend"* (நட்பு துரோகம்)
3. *"Controlling anger and rage"* (சினம் தவிர்த்தல்)
4. *"Staying ethical while earning wealth"* (நேர்மையான செல்வம்)


* Clean submit button with loading spinner state.

#### 4.4.3 Results Presentation (`src/components/KuralCard.tsx`)

* **Confidence Logic:**
* **High Confidence ($\ge 0.55$):** Highlight the single best matching Kural in an elevated primary Card with a subtle accent border and a *"View 2 more related Kurals"* expand button.
* **Moderate Confidence ($0.35 \le \text{Score} < 0.55$):** Render the top 3 matching Kurals sequentially with similarity percentage badges.


* **Card Anatomy:**
1. **Header Badge:** Chapter name in Tamil & English + Kural number (`குறள் #619 • ஆள்வினையுடைமை (Energy)`).
2. **Verse:** Tamil couplet formatted in bold serif typography.
3. **English Translation:** G.U. Pope / English explanation in italics.
4. **Primary Commentary (Default View):** Mu. Varadarajan (மு. வரதராசனார் உரை) prominently shown in a light container.
5. **Scholarly Accordion (Collapsible):** shadcn `Accordion` to reveal the other 4 commentaries:
* சாலமன் பாப்பையா உரை (Solomon Pappaiah)
* கலைஞர் மு. கருணாநிதி உரை (M. Karunanidhi)
* பரிமேலழகர் உரை (Parimelazhagar)
* மணக்குடவர் உரை (Manakkudavar)





#### 4.4.4 Low-Confidence / Gibberish Fallback (`src/components/EmptyFallback.tsx`)

* Triggers when the top similarity score is $< 0.35$.
* **Creative Guardrail Message:**
> "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்
> மெய்ப்பொருள் காண்ப தறிவு." *(குறள் 423)*
> *“To discern the truth in everything, by whomever spoken, is true wisdom.”*
> We couldn't find a close Kural matching this input. Please describe your situation with more detail or emotional context.



---

## 5. Verification & Testing Checklist

* [ ] **Data Pipeline Test:** Running `uv run prepare_data.py` generates `public/kurals.json` (1,330 items) and `public/kural_embeddings.bin` (exactly 2,042,880 bytes).
* [ ] **Offline Execution:** Open browser DevTools $\rightarrow$ Application $\rightarrow$ Service Workers $\rightarrow$ Set to **Offline**. Refresh the page and execute a query; results should return in $< 50\text{ ms}$.
* [ ] **Cross-Lingual Retrieval Accuracy:**
* Query: *"feeling sad because friend cheated"* $\rightarrow$ Top match belongs to Chapter 80 (நட்பாராய்தல் / Friendship) or Chapter 82 (தீ நட்பு / Bad Friendship).
* Query: *"exam failure feeling lost"* $\rightarrow$ Top match belongs to Chapter 62 (ஆள்வினையுடைமை / Effort) or Chapter 63 (இடுக்கணழியாமை / Not Grieving in Misfortune).


* [ ] **Accordion & Commentary Verification:** Expanding the accordion shows non-empty text for all 4 alternate Tamil scholars.
* [ ] **Mobile Responsiveness:** Viewport constrained to 375px–430px displays zero horizontal scrolling and comfortable tap targets.

```