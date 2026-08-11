from vector_store import VectorStore


chunks = [
    "Python is a programming language used for software development.",
    "Machine learning algorithms learn patterns from data.",
    "Pune is a city located in Maharashtra, India.",
    "FastAPI is a Python framework for building APIs."
]


store = VectorStore()

store.create_index(chunks)

query = "What is used to learn patterns?"

results = store.search(query)

print("\nRelevant chunks:\n")

for result in results:
    print("-", result)