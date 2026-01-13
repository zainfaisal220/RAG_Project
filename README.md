# RAG-Based Chatbot - Full Stack Application

A full-stack chatbot application with React frontend and Flask backend, implementing RAG (Retrieval-Augmented Generation) architecture using a data structures knowledge base.

## Features

- **RAG Architecture**: Retrieval-Augmented Generation using TF-IDF vector similarity
- **React Frontend**: Modern, responsive UI built with React and Vite
- **Flask Backend**: RESTful API with RAG implementation
- **PDF Integration**: Uses "Data structures concepts and programming questions" PDF as knowledge base
- **Real-time Chat**: Interactive chat interface with message history
- **Fallback System**: Direct API calls when RAG context is insufficient

## Project Structure

```
d:/Chatbot/
├── app.py                 # Flask backend with RAG implementation
├── requirements.txt       # Python dependencies
├── config.py             # Configuration settings
├── package.json          # React dependencies
├── vite.config.js        # Vite configuration
├── index.html            # Main HTML file
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Main React component
│   ├── App.css           # Component styles
│   └── index.css         # Global styles
└── Data structures concepts and programming questions (1).pdf  # Knowledge base
```

## Setup Instructions

### Backend Setup (Flask)

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask backend:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup (React)

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Backend API

- `GET /` - Health check
- `GET /api/health` - System status and RAG initialization status
- `POST /api/chat` - Main chat endpoint with RAG
- `POST /api/direct-chat` - Direct chat without RAG (fallback)

### Frontend Routes

- `/` - Main chat interface

## RAG Implementation

The RAG system works as follows:

1. **Document Processing**: PDF text is extracted and split into chunks
2. **Vectorization**: TF-IDF vectors are created for each chunk
3. **Retrieval**: User queries are matched against document chunks using cosine similarity
4. **Generation**: Relevant context is provided to the LLM for answer generation

## Configuration

### API Configuration

Edit `app.py` to configure:
- API key and endpoint
- RAG parameters (chunk size, similarity threshold)

### Frontend Configuration

Edit `vite.config.js` to configure:
- Development server port
- API proxy settings

## Usage

1. Start the Flask backend
2. Start the React frontend
3. Open `http://localhost:3000` in your browser
4. Ask questions about data structures and programming concepts

## Dependencies

### Backend Dependencies
- Flask: Web framework
- PyPDF2: PDF text extraction
- scikit-learn: TF-IDF vectorization and similarity calculation
- requests: API calls
- flask-cors: CORS handling

### Frontend Dependencies
- React: UI framework
- Vite: Build tool and dev server
- Axios: HTTP client

## Development

### Backend Development
```bash
# Run with auto-reload
python app.py

# Install new dependencies
pip install <package-name>
pip freeze > requirements.txt
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Common Issues

1. **PDF not found**: Ensure "Data structures concepts and programming questions (1).pdf" is in the root directory
2. **API errors**: Check API key configuration in `app.py`
3. **CORS errors**: Verify flask-cors is installed and configured
4. **Port conflicts**: Change ports in `app.py` (5000) and `vite.config.js` (3000)

### Debug Mode

Enable debug mode by setting `debug=True` in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.