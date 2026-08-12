# DocuMind

DocuMind is a local document question-answering application that allows users to upload a PDF and ask questions about its contents.

It uses a Retrieval-Augmented Generation (RAG) pipeline to retrieve relevant sections from the uploaded document and provide them as context to a locally running Llama model.

## Features

* Upload PDF documents
* Extract text from PDF files
* Split documents into smaller chunks
* Generate semantic embeddings for document chunks
* Perform vector similarity search using FAISS
* Retrieve the most relevant document sections for a question
* Generate answers using a locally running Llama model
* Display retrieved source chunks alongside the answer
* Run the complete application locally without a cloud LLM API

## Architecture

DocuMind follows a Retrieval-Augmented Generation (RAG) architecture.

```text
                         React Frontend
                              |
                    Upload PDF / Ask Question
                              |
                              v
                        FastAPI Backend
                              |
              +---------------+---------------+
              |                               |
              v                               v
        PDF Processing                  Question Processing
              |                               |
        PyPDF Extraction              Query Embedding
              |                               |
              v                               |
       Text Chunking                            |
              |                               |
              v                               |
       Text Embeddings                         |
              |                               |
              v                               v
           FAISS <---------------------- Similarity Search
              |
              v
       Relevant Document Chunks
              |
              v
        Ollama / Llama 3.2
              |
              v
        Generated Answer
              |
              v
        React Frontend
       Answer + Sources
```

### Request Flow

1. The user uploads a PDF through the React frontend.
2. The PDF is sent to the FastAPI backend.
3. PyPDF extracts text from the document.
4. The extracted text is divided into smaller chunks.
5. Sentence Transformers generates embeddings for each chunk.
6. The embeddings are stored in a FAISS index.
7. The user submits a question.
8. The question is converted into an embedding.
9. FAISS searches for the most similar document chunks.
10. The top relevant chunks are retrieved.
11. The retrieved chunks are passed as context to the Llama model through Ollama.
12. The generated answer and source chunks are returned to the frontend.

## How RAG Works

Retrieval-Augmented Generation combines document retrieval with language model generation.

DocuMind implements RAG in two main stages.

### 1. Document Processing and Retrieval

When a PDF is uploaded:

```text
PDF
 |
 v
Text Extraction
 |
 v
Text Chunking
 |
 v
Embeddings
 |
 v
FAISS Vector Index
```

The application uses `RecursiveCharacterTextSplitter` to divide the extracted text into smaller chunks.

Current configuration:

* Chunk size: 500 characters
* Chunk overlap: 50 characters

Each chunk is converted into an embedding using:

```text
all-MiniLM-L6-v2
```

These embeddings are stored in a FAISS `IndexFlatL2` index.

When the user asks a question, the question is also converted into an embedding. FAISS then performs a similarity search to find the most relevant document chunks.

DocuMind retrieves the top 3 chunks by default.

### 2. Answer Generation

The retrieved chunks are provided to the Llama model as context.

```text
User Question
      +
Relevant Document Chunks
      |
      v
   Llama 3.2
      |
      v
Generated Answer
```

The model is instructed to answer using the provided document context. If the required information cannot be found in the retrieved context, it is instructed to indicate that the information could not be found in the document.

This helps keep the generated response grounded in the uploaded document.

## Tech Stack

### Frontend

| Technology | Purpose                                |
| ---------- | -------------------------------------- |
| React      | User interface                         |
| Vite       | Frontend development and build tooling |
| CSS        | Styling                                |

### Backend

| Technology            | Purpose                  |
| --------------------- | ------------------------ |
| Python                | Backend development      |
| FastAPI               | REST API                 |
| PyPDF                 | PDF text extraction      |
| LangChain             | Text splitting           |
| Sentence Transformers | Text embeddings          |
| FAISS                 | Vector similarity search |
| Ollama                | Local LLM inference      |

### Models

| Component       | Model               |
| --------------- | ------------------- |
| Embedding Model | `all-MiniLM-L6-v2`  |
| Language Model  | `llama3.2:3b`       |
| Vector Index    | FAISS `IndexFlatL2` |

## Project Structure

```text
DocuMind/
|
├── backend/
│   ├── main.py
│   ├── vector_store.py
│   └── requirements.txt
|
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
|
├── screenshots/
│   ├── upload.png
│   └── chat.png
|
└── README.md
```

## Running Locally

### Prerequisites

Make sure the following are installed:

* Python 3.10+
* Node.js and npm
* Ollama
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/shravanikalapure/DocuMind.git
cd DocuMind
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

### 3. Set Up Ollama

Install Ollama from:

https://ollama.com/

Pull the model used by DocuMind:

```bash
ollama pull llama3.2:3b
```

Verify that the model is available:

```bash
ollama list
```

Make sure Ollama is running before using the question-answering functionality.

### 4. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

### 5. Use the Application

1. Open the frontend in your browser.
2. Select a PDF document.
3. Upload the document.
4. Wait for the document to be processed.
5. Enter a question about the document.
6. Submit the question.
7. View the generated answer and retrieved source chunks.

## API Endpoints

### `GET /`

Checks whether the backend API is running.

### `POST /upload`

Uploads and processes a PDF document.

The backend extracts the text, creates chunks, generates embeddings, and builds the FAISS index.

### `POST /search`

Searches the uploaded document for relevant chunks.

Example request:

```json
{
  "query": "What is the main topic of the document?",
  "k": 3
}
```

### `POST /ask`

Retrieves relevant document chunks and generates an answer using the Llama model.

Example request:

```json
{
  "query": "What is the main topic of the document?",
  "k": 3
}
```

The response contains the question, generated answer, and retrieved sources.

## Current Limitations

* PDF is the primary supported document format.
* The application currently works with one active document index at a time.
* The FAISS index is maintained in memory.
* Scanned or image-only PDFs may require OCR for accurate text extraction.
* Retrieved sources are displayed as text chunks rather than exact page references.
* Answer quality depends on the retrieved context and the selected local model.
* The application is currently configured for local development.

## Future Improvements

* Support additional document formats such as DOCX and TXT
* Add OCR support for scanned PDFs
* Display exact page numbers for retrieved sources
* Support multiple documents and document collections
* Add persistent vector indexes
* Add document history and management
* Allow configurable chunk size and retrieval count
* Add authentication and user-specific document collections
* Improve retrieval using reranking
* Add evaluation metrics for retrieval and answer quality
* Support additional local and cloud-based language models
* Deploy the application for remote access

## Learning Outcomes

Building DocuMind provided hands-on experience with:

* Retrieval-Augmented Generation
* Semantic search
* Text embeddings
* Vector similarity search
* FAISS
* Local LLM inference
* FastAPI
* React
* REST API integration
* Building an end-to-end AI application

## Author

**Shravani Kalapure**

Computer Engineering Student | Generative AI Minor

GitHub: https://github.com/shravanikalapure
