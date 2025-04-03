# RAG System using LangChain

This project implements a **Retrieval-Augmented Generation (RAG) System** using **LangChain** and **FAISS** for efficient document retrieval and question-answering.

## Features
- Load and process PDF documents
- Chunk text data for optimized retrieval
- Generate embeddings using Hugging Face models
- Store and retrieve documents with FAISS vector database
- Use Hugging Face LLM for question-answering

## Technologies & Libraries Used
- **Programming Language:** Python
- **Libraries:**
  - `langchain-community` (Document processing and retrieval)
  - `langchain-huggingface` (Hugging Face integrations)
  - `faiss-cpu` (Vector database for efficient searching)
  - `sentence-transformers` (Embedding models)
  - `PyPDFLoader` (PDF document processing)

## Installation
Ensure you have Python installed, then install the required dependencies:
```bash
pip install langchain-community langchain-huggingface faiss-cpu
```

## Project Setup
### 1. Load PDF Documents
```python
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
DATA = "/path/to/your/pdf/files"
def load_pdf_files(directory):
    loader = DirectoryLoader(directory, glob="*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    return documents

documents = load_pdf_files(DATA)
print(f"Loaded {len(documents)} documents")
```

### 2. Text Chunking
```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
def create_chunk(extracted_data):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=550, chunk_overlap=40)
    return text_splitter.split_documents(extracted_data)

text_chunk = create_chunk(documents)
print("Chunk length:", len(text_chunk))
```

### 3. Generate Embeddings
```python
from langchain_huggingface import HuggingFaceEmbeddings
def get_embed():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
embeding_model = get_embed()
```

### 4. Store Data in FAISS Vector Database
```python
from langchain_community.vectorstores import FAISS
DB_FAISS_PATH = "vectorstore/db_faiss"
db = FAISS.from_documents(text_chunk, embeding_model)
db.save_local(DB_FAISS_PATH)
```

### 5. Implement Retrieval-Augmented QA System
```python
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=HuggingFaceEndpoint("huggingface_repo"),
    retriever=db.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

user_query = input("Write your query: ")
response = qa_chain.invoke({"query": user_query})

print("Result:", response["result"])
print("Source Document:", response["source_documents"])
```

## Usage
1. Place your PDF files in the specified directory.
2. Run the script to process the documents and generate embeddings.
3. Use the retrieval system to ask questions based on the stored documents.

## Future Enhancements
- Support for multiple document formats
- Improved retrieval accuracy with advanced models
- Deployment as an API or web interface

## License
This project is open-source and available under the MIT License.

