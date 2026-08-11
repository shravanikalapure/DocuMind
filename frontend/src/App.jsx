import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);
      alert("PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
  if (!question.trim()) return;

  try {
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: question,
        k: 3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      setAnswer("Something went wrong while asking the document.");
      return;
    }

    setAnswer(data.answer);
  } catch (error) {
    console.error(error);
    setAnswer("Could not connect to the backend.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="app">
      <header className="header">
        <h1>DocuMind</h1>
        <p>Chat with your documents using AI</p>
      </header>

      <main className="container">

        <section className="upload-section">
          <h2>Upload a document</h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload PDF"}
          </button>
        </section>

        <section className="chat-section">
          <h2>Ask your document</h2>

          <div className="question-box">
            <input
              type="text"
              placeholder="Ask something about your PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAsk();
                }
              }}
            />

            <button onClick={handleAsk} disabled={loading}>
              Ask
            </button>
          </div>

          {answer && (
            <div className="answer">
              <h3>Answer</h3>
              <p>{answer}</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;