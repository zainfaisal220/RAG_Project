import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { 
      text: input, 
      sender: 'user', 
      timestamp: new Date(),
      id: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat', { question: input })
      const botMessage = { 
        text: response.data.answer, 
        sender: 'bot', 
        timestamp: new Date(),
        source: response.data.source,
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot', 
        timestamp: new Date(),
        source: 'error',
        id: Date.now() + 1
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-primary-950 text-primary-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-primary-900/80 backdrop-blur-md border-b border-primary-800"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AlgoMate</h1>
                <p className="text-primary-400 text-sm">Your Data Structures Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                className="px-4 py-2 bg-primary-800/50 hover:bg-primary-700/50 border border-primary-700 rounded-lg text-primary-300 text-sm transition-all"
              >
                Clear Chat
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col h-[calc(100vh-140px)]">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">A</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-100 mb-2">Welcome to AlgoMate</h3>
                <p className="text-primary-400 max-w-md mx-auto">
                  Ask me anything about data structures, algorithms, or programming concepts. 
                  I'm here to help you learn and understand computer science fundamentals.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`relative group ${message.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
                          <div className={`rounded-2xl p-4 ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                              : 'bg-primary-900 border border-primary-800 text-primary-100'
                          }`}>
                            <div className="prose prose-invert max-w-none">
                              <p className="whitespace-pre-wrap">{message.text}</p>
                            </div>
                            
                            {/* Message Meta */}
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.source && (
                                <span className="text-primary-400">via {message.source}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Copy Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyMessage(message.text)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary-800/50 rounded"
                          >
                            📋
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] mr-12">
                      <div className="bg-primary-900 border border-primary-800 rounded-2xl p-4">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 bg-primary-950/80 backdrop-blur-md pt-4"
          >
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about data structures, algorithms, or programming concepts..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-primary-900/50 border border-primary-800 rounded-xl resize-none text-primary-100 placeholder-primary-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <div className="absolute bottom-2 right-2 text-xs text-primary-500">
                  Enter to send • Shift+Enter for new line
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isLoading || !input.trim()
                    ? 'bg-primary-800/30 text-primary-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send'
                )}
              </motion.button>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-xs text-primary-500">
                AlgoMate • Powered by RAG Technology • Data Structures Expert
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App