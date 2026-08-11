import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class VectorStore:
    def __init__(self):
        # Small, fast, good general-purpose embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.index = None
        self.chunks = []

    def create_index(self, chunks):
        """
        Convert text chunks into embeddings
        and store them in FAISS.
        """

        self.chunks = chunks

        # Convert chunks into numerical vectors
        embeddings = self.model.encode(
            chunks,
            convert_to_numpy=True
        )

        # FAISS needs float32 vectors
        embeddings = embeddings.astype("float32")

        # Number of dimensions in each embedding
        dimension = embeddings.shape[1]

        # Create FAISS index
        self.index = faiss.IndexFlatL2(dimension)

        # Add embeddings to FAISS
        self.index.add(embeddings)

        return len(chunks)

    def search(self, query, k=3):
        """
        Find the most relevant chunks for a question.
        """

        if self.index is None:
            return []

        # Convert question into an embedding
        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True
        ).astype("float32")

        # Search FAISS
        distances, indices = self.index.search(
            query_embedding,
            k
        )

        results = []

        for index in indices[0]:
            if index < len(self.chunks):
                results.append(self.chunks[index])

        return results