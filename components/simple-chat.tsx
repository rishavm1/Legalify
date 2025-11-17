'use client';

import React, { useState } from 'react';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import { LanguageSelectorButton } from '@/components/LanguageSelectorButton';

export function SimpleChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Send request to Flask backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:5000',
        sources: [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleVoiceInput = (transcript) => {
    setInputText(transcript);
    sendMessage(transcript);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🏛️ Legalify RAG Demo</h1>
            <p className="text-neutral-400">Flask Backend + React Frontend Integration</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelectorButton onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-4xl mx-auto p-4 h-[calc(100vh-200px)] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl mb-4">Welcome to Legalify RAG System! 👋</h2>
              <p className="text-neutral-400 mb-6">Ask me anything about Indian Law:</p>
              <div className="space-y-2 max-w-2xl mx-auto">
                <button 
                  onClick={() => sendMessage("What is the punishment for murder under IPC?")}
                  className="block w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                >
                  What is the punishment for murder under IPC?
                </button>
                <button 
                  onClick={() => sendMessage("What is cheating under Indian law?")}
                  className="block w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                >
                  What is cheating under Indian law?
                </button>
                <button 
                  onClick={() => sendMessage("Explain Article 21 of Constitution")}
                  className="block w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                >
                  Explain Article 21 of Constitution
                </button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-sm text-neutral-300">
                        <strong>📚 Sources:</strong>
                        <ul className="mt-1 space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index} className="text-xs">• {source}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-neutral-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-neutral-300">Searching legal database...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 pt-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about Indian law, legal procedures, or document drafting..."
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-white/40"
              disabled={isTyping}
            />
            <VoiceInputButton onInputReceived={handleVoiceInput} />
            <button 
              type="submit" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={isTyping || !inputText.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}