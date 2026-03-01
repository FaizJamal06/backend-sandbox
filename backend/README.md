# Legal Drafting POC Backend

This is the backend service for the Legal Drafting Proof of Concept application. It provides an API that integrates with OpenRouter for language models and includes a fact verification engine.

## Features

* **AI Drafting Engine:** Uses AI models via OpenRouter (and Groq) to assist with drafting legal documents.
* **Fact Verification:** Extracts and verifies facts from legal text against a provided corpus.
* **Local Corpus Retrieval:** Supports retrieving information from a local `json` corpus of legal data.

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* NPM or Yarn

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on required environment variables:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   GROQ_API_KEY=your_groq_api_key
   LEGAL_CORPUS_PATH=data/legal_corpus.json
   OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
   ```
   *(Note: Do not commit your actual `.env` file to version control)*

### Running the Application

To start the development server using `nodemon` (restarts automatically on file changes):

```bash
npm run dev
```

To start the standard server:

```bash
npm start
```

The server will be available at `http://localhost:4000`.

## Scripts Available

* `npm run dev`: Starts the server with `nodemon`.
* `npm start`: Starts the server normally.
* Additional test scripts are available in the `scripts/` directory (e.g., `node scripts/test-openrouter.js`).
