from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import PyPDF2
import re
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

# API configuration - using environment variables
API_KEY = os.getenv('GROQ_API_KEY', '')
API_URL = os.getenv('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions')
MODEL_NAME = os.getenv('GROQ_MODEL_NAME', 'openai/gpt-oss-120b')

# Global variables for RAG system
document_chunks = []

def extract_text_from_pdf():
    """Extract text from PDF and split into chunks"""
    global document_chunks
    
    try:
        pdf_path = "Data structures concepts and programming questions (1).pdf"
        
        if not os.path.exists(pdf_path):
            return False, "PDF file not found"
        
        # Extract text from PDF
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        # Split into chunks
        chunks = []
        sentences = text.split('. ')
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk + sentence) < 500:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        document_chunks = chunks
        return True, f"PDF processed successfully. Created {len(chunks)} chunks."
    
    except Exception as e:
        return False, f"Error processing PDF: {str(e)}"

def find_relevant_chunks(question, top_k=3):
    """Find the most relevant chunks using simple text matching"""
    if not document_chunks:
        return []
    
    # Simple keyword matching
    question_words = set(re.findall(r'\w+', question.lower()))
    
    relevant_chunks = []
    for i, chunk in enumerate(document_chunks):
        chunk_words = set(re.findall(r'\w+', chunk.lower()))
        
        # Calculate simple overlap
        overlap = len(question_words.intersection(chunk_words))
        
        if overlap > 0:
            relevant_chunks.append({
                'text': chunk,
                'similarity': overlap,
                'index': i
            })
    
    # Sort by similarity and return top-k
    relevant_chunks.sort(key=lambda x: x['similarity'], reverse=True)
    return relevant_chunks[:top_k]

def call_groq_api(messages):
    """Call Groq API for chat completion"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 800
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"API Request Error: {e}")
        return {"error": f"Network error: {str(e)}"}
    except Exception as e:
        logger.error(f"API Error: {e}")
        return {"error": str(e)}

def get_natural_response(question, context=""):
    """Generate a natural, ChatGPT-like response when API fails"""
    question_lower = question.lower()
    
    # Handle casual greetings
    if any(greeting in question_lower for greeting in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! I'm here to help you learn about data structures and programming concepts. What would you like to know about today?"
    
    # Handle general questions about the bot
    if any(phrase in question_lower for phrase in ['who are you', 'what are you', 'what can you do']):
        return "I'm an AI assistant specialized in data structures and programming concepts. I can help explain various computer science topics, answer questions about algorithms, and provide guidance on programming concepts. Feel free to ask me anything!"
    
    # Handle data structure questions naturally
    if "data structure" in question_lower:
        return "A data structure is essentially a way to organize and store data so we can access and modify it efficiently. Think of it like organizing your bookshelf - different arrangements work better for different purposes. Arrays are like numbered shelves where you can instantly grab any book, while linked lists are more like a chain where each book points to the next."
    
    elif "linked list" in question_lower:
        return "Linked lists are interesting because they're made up of nodes that each contain some data and a pointer to the next node. It's like a treasure hunt where each clue leads you to the next one. This makes them great for situations where you need to frequently add or remove items, but not so great when you need to quickly find a specific item by its position."
    
    elif "array" in question_lower:
        return "Arrays are collections of items stored in contiguous memory locations. The main advantage is that you can access any element instantly if you know its index - that's called random access. However, if you need to insert or delete items in the middle, it can be inefficient because you might have to shift all the following elements."
    
    elif "stack" in question_lower:
        return "Stacks follow the 'last in, first out' principle - imagine a stack of plates where you always take from the top. This makes them perfect for operations like tracking function calls in programming or implementing undo functionality."
    
    elif "queue" in question_lower:
        return "Queues work on 'first in, first out' - like people waiting in line. The first person to arrive is the first to be served. This is essential for task scheduling and handling requests in order."
    
    elif "tree" in question_lower:
        return "Trees are hierarchical structures where each node can have children, much like a family tree or company organization chart. They're excellent for representing relationships and enabling efficient searching through techniques like binary search."
    
    elif "graph" in question_lower:
        return "Graphs are powerful for modeling complex relationships - think of social networks where people are connected, or maps where cities are linked by roads. They can represent virtually any interconnected system."
    
    else:
        return f"That's an interesting question about {question}! I can help explain how this relates to data structures and programming concepts. Essentially, understanding different data structures helps us choose the right tool for specific tasks based on what operations we need to perform most frequently."

@app.route('/')
def serve_frontend():
    """Serve the frontend application"""
    return send_from_directory('dist', 'index.html')

@app.route('/api/health')
def health_check():
    status, message = extract_text_from_pdf()
    return jsonify({
        "status": "healthy",
        "service": "Chatbot API",
        "rag_status": "initialized" if status else "error",
        "rag_message": message
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        # Initialize RAG system if not already done
        if not document_chunks:
            success, message = extract_text_from_pdf()
            if not success:
                return jsonify({"error": message}), 500
        
        # Find relevant chunks
        relevant_chunks = find_relevant_chunks(question)
        
        # Prepare context for the LLM
        context = ""
        if relevant_chunks:
            context = "Here's some relevant information from our data structures curriculum:\n"
            for i, chunk in enumerate(relevant_chunks[:3]):
                context += f"\n{i+1}. {chunk['text']}\n"
        
        # Natural, ChatGPT-like system prompt
        natural_prompt = """You are a helpful AI assistant that explains concepts in a natural, conversational way. Respond like ChatGPT would - use plain text without markdown formatting, tables, or special characters. 

Guidelines:
- Use natural, flowing language
- Avoid markdown (#, *, |, etc.)
- Don't use numbered lists with emojis
- Be conversational and engaging
- If the user greets you, respond naturally
- Explain concepts clearly but conversationally
- Use analogies and examples when helpful
- Keep responses focused but natural

Remember: You're having a conversation, not writing a textbook."""

        # Try to call external API first
        messages = [
            {
                "role": "system",
                "content": natural_prompt
            }
        ]
        
        if context:
            messages.append({
                "role": "user",
                "content": f"Question: {question}\n\nContext: {context}\n\nPlease provide a natural, conversational answer."
            })
        else:
            messages.append({
                "role": "user",
                "content": f"Question: {question}\n\nPlease provide a natural, conversational answer."
            })
        
        # Call the API
        response = call_groq_api(messages)
        
        if "error" in response:
            # Fallback to natural response
            answer = get_natural_response(question, context)
            source = "Local Knowledge Base"
        else:
            answer = response["choices"][0]["message"]["content"]
            source = "RAG System"
        
        return jsonify({
            "question": question,
            "answer": answer,
            "source": source,
            "relevant_chunks": len(relevant_chunks)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/direct-chat', methods=['POST'])
def direct_chat():
    """Direct chat without RAG (fallback)"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        natural_prompt = """You are a helpful AI assistant that explains concepts in a natural, conversational way. Respond like ChatGPT would - use plain text without markdown formatting."""
        
        messages = [
            {
                "role": "system",
                "content": natural_prompt
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nPlease provide a natural, conversational answer."
            }
        ]
        
        response = call_groq_api(messages)
        
        if "error" in response:
            answer = get_natural_response(question)
            source = "Local Knowledge Base"
        else:
            answer = response["choices"][0]["message"]["content"]
            source = "Direct API"
        
        return jsonify({
            "question": question,
            "answer": answer,
            "source": source
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize RAG system on startup
    logger.info("Initializing RAG system...")
    success, message = extract_text_from_pdf()
    if success:
        logger.info("RAG system initialized successfully")
    else:
        logger.warning(f"RAG initialization warning: {message}")
    
    logger.info("Starting unified Flask application...")
    app.run(debug=True, host='0.0.0.0', port=5000)