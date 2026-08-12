import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setUploadedFile(file.name);
      setMessages([]);

      alert("PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed. Make sure the backend is running.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: currentQuestion,
          k: 3,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your question. Please make sure the backend is running and a PDF has been uploaded.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">📄 DocuMind</div>

        <h1>Chat with your documents</h1>

        <p>
          Upload a PDF and ask questions. DocuMind finds relevant information
          and answers using AI.
        </p>
      </header>

      <main className="container">
        {/* Upload Card */}
        <section className="upload-section">
          <div className="section-title">
            <span className="step-number">1</span>

            <div>
              <h2>Upload your document</h2>
              <p>Choose a PDF to start chatting with it.</p>
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-icon">📁</div>

            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label htmlFor="pdf-upload" className="file-label">
              {file ? file.name : "Choose a PDF file"}
            </label>

            {file && (
              <p className="file-name">
                Selected: <strong>{file.name}</strong>
              </p>
            )}

            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>

            {uploadedFile && (
              <div className="upload-success">
                ✓ {uploadedFile} uploaded successfully
              </div>
            )}
          </div>
        </section>

        {/* Chat Card */}
        <section className="chat-section">
          <div className="section-title">
            <span className="step-number">2</span>

            <div>
              <h2>Ask your document</h2>
              <p>Ask anything about the information inside your PDF.</p>
            </div>
          </div>

          {/* Chat History */}
          <div className="chat-history">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>

                <h3>Start a conversation</h3>

                <p>
                  Try asking something like:
                </p>

                <div className="example-question">
                  "What projects has Shravani worked on?"
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                className={`message ${message.role}`}
                key={index}
              >
                <div className="message-label">
                  {message.role === "user" ? "You" : "🤖 DocuMind"}
                </div>

                <div className="message-content">
                  {message.content}
                </div>

                {message.role === "assistant" &&
                  message.sources &&
                  message.sources.length > 0 && (
                    <div className="message-sources">
                      <strong>📚 Sources</strong>

                      {message.sources.map((source, sourceIndex) => (
                        <div className="source" key={sourceIndex}>
                          {source}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-label">🤖 DocuMind</div>

                <div className="message-content loading-message">
                  Thinking<span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Question Box */}
          <div className="question-box">
            <input
              type="text"
              placeholder="Ask something about your PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleAsk();
                }
              }}
              disabled={loading}
            />

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
            >
              {loading ? "..." : "Ask →"}
            </button>
          </div>
        </section>
      </main>

      <footer>
        Built with React • FastAPI • FAISS • LangChain • Ollama
      </footer>
    </div>
  );
}

export default App;