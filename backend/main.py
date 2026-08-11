from fastapi import FastAPI, UploadFile, File
from vector_store import VectorStore
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ollama import chat
import io

app = FastAPI()

vector_store = VectorStore()

@app.get("/")
def home():
    return {"message": "DocuMind API is running!"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()

    reader = PdfReader(io.BytesIO(pdf_bytes))

    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)

    vector_store.create_index(chunks)

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "total_chunks": len(chunks),
        "chunks": chunks[:5]
    }

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    k: int = 3


@app.post("/search")
def search_documents(request: SearchRequest):
    results = vector_store.search(
        request.query,
        request.k
    )

    return {
        "query": request.query,
        "results": results
    }

@app.post("/ask")
def ask_question(request: SearchRequest):
    results = vector_store.search(
        request.query,
        request.k
    )

    context = "\n\n".join(results)

    prompt = f"""
You are a document question-answering assistant.

Answer the user's question using ONLY the information provided
in the document context below.

If the answer cannot be found in the context, say:
"I couldn't find that information in the document."

Document context:
{context}

Question:
{request.query}
"""

    response = chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return {
        "question": request.query,
        "answer": response["message"]["content"],
        "sources": results
    }