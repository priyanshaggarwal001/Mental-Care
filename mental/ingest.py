import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb

# 1. Load the PDF from your /data folder
loader = PyPDFLoader("./data/cbt_mannual.pdf") 
docs = loader.load()

# 2. Split it into small pieces (500 characters each)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = text_splitter.split_documents(docs)

# 3. Store in ChromaDB
client = chromadb.PersistentClient(path="./db")
collection = client.get_or_create_collection(name="clinical_knowledge")

for i, chunk in enumerate(chunks):
    collection.add(
        documents=[chunk.page_content],
        ids=[f"chunk_{i}"]
    )

print(f"Successfully indexed {len(chunks)} clinical chunks!")