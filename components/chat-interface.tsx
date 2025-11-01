"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { AgreementWorkflow } from '@/components/agreement-workflow';
import { Upload, Plus, MessageSquare, FileText, Download, Trash2, Copy, RotateCcw, ArrowLeft, Scale } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  metadata?: any;
}

export function ChatInterface() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgreementWorkflow, setShowAgreementWorkflow] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      loadSessions();
      initializeUserMemory();
    }
  }, [session]);
  
  const initializeUserMemory = async () => {
    try {
      // Initialize user memory for first-time users
      await fetch('/api/user/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryType: 'preference',
          key: 'initialized',
          value: { timestamp: new Date().toISOString(), version: '2.0' }
        })
      });
    } catch (error) {
      console.error('Failed to initialize user memory:', error);
    }
  };

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        
        if (data.sessions?.length > 0 && !currentSession) {
          setCurrentSession(data.sessions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(prev => [data.session, ...prev]);
        setCurrentSession(data.session);
        setMessages([]);
        setShowAgreementWorkflow(false);
      } else {
        console.error('Failed to create session:', await response.text());
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!currentSession) {
      await createNewSession();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!currentSession) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', currentSession.id);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      const fileMessage = `Uploaded: ${file.name}\n\n${data.extractedText || 'File uploaded successfully'}`;
      await sendMessage(fileMessage, { fileContext: data.file });
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleSendMessage = async (message: string, files?: File[]) => {
    let sessionToUse = currentSession;
    
    if (!sessionToUse) {
      await createNewSession();
      await new Promise(resolve => setTimeout(resolve, 500));
      sessionToUse = currentSession;
    }
    
    if (!sessionToUse) {
      console.error('Failed to create session');
      return;
    }
    
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
    
    if (message.trim()) {
      await sendMessage(message);
    }
  };

  const sendMessage = async (content?: string, metadata?: any) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;
    
    if (!currentSession) {
      await createNewSession();
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!currentSession) return;
    }

    const agreementKeywords = ['agreement', 'contract', 'draft agreement'];
    const isAgreementRequest = agreementKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword)
    );

    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          sessionId: currentSession.id,
          fileContext: metadata?.fileContext
        })
      });

      if (response.ok) {
        await loadMessages(currentSession.id);
        await loadSessions();

        if (isAgreementRequest && (messageContent.toLowerCase().includes('land') || messageContent.toLowerCase().includes('builder'))) {
          setTimeout(() => setShowAgreementWorkflow(true), 1000);
        }
      } else {
        console.error('Failed to send message:', await response.text());
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDocumentGenerated = async (document: string) => {
    setGeneratedDocument(document);
    // Keep the workflow open to show the document result
    // Don't set setShowAgreementWorkflow(false) here
    
    // Optionally send the generated document as a message
    if (currentSession) {
      await sendMessage(`📄 **Agreement Generated Successfully**\n\nDocument has been generated and is ready for download.`);
    }
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-agreement.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingSessionId(null);
      setShowDeleteConfirm(null);
    }
  };

  const clearAllHistory = async () => {
    if (sessions.length === 0) return;
    
    const confirmClear = window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.');
    if (!confirmClear) return;
    
    try {
      await Promise.all(sessions.map(session => 
        fetch(`/api/chat/sessions/${session.id}`, { method: 'DELETE' })
      ));
      
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear all history:', error);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-80 glass-sidebar flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Scale className="w-6 h-6 text-black" />
            </div>
            <span className="font-bold text-white text-xl">Legalify</span>
          </div>
          <Button 
            onClick={createNewSession}
            className="premium-button w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-xl hover:shadow-amber-400/25 rounded-xl h-12"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center text-neutral-400 mt-12 fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 opacity-60" />
              </div>
              <p className="text-base font-medium">No chats yet</p>
              <p className="text-sm text-neutral-500 mt-1">Start a conversation to begin</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-neutral-400 font-medium">Chat History</span>
                <Button
                  onClick={clearAllHistory}
                  variant="ghost"
                  size="sm"
                  className="premium-button text-xs text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
              {sessions.map((sessionItem) => (
                <div
                  key={sessionItem?.id || Math.random()}
                  className={`group relative rounded-xl transition-all duration-300 ${
                    currentSession?.id === sessionItem?.id
                      ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-400/30 shadow-lg glow-border'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/10 card-hover'
                  }`}
                >
                  <button
                    onClick={() => setCurrentSession(sessionItem)}
                    className="w-full text-left p-4 flex items-center transition-all duration-200"
                  >
                    <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate font-medium ${
                        currentSession?.id === sessionItem?.id ? 'text-white' : 'text-neutral-300'
                      }`}>
                        {sessionItem?.title || 'Untitled Chat'}
                      </span>
                      <div className="text-xs text-neutral-500 mt-1 font-medium">
                        {sessionItem?.updated_at ? new Date(sessionItem.updated_at).toLocaleDateString() : 'Just now'}
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(sessionItem.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  
                  {showDeleteConfirm === sessionItem.id && (
                    <div className="absolute inset-0 bg-neutral-900 rounded-lg p-2 flex items-center justify-between border border-red-500/50">
                      <span className="text-xs text-white">Delete chat?</span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => deleteSession(sessionItem.id)}
                          disabled={deletingSessionId === sessionItem.id}
                          size="sm"
                          className="h-6 px-2 text-xs bg-red-600 hover:bg-red-700"
                        >
                          {deletingSessionId === sessionItem.id ? '...' : 'Yes'}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(null)}
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-neutral-400 hover:text-white"
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {showAgreementWorkflow ? (
          <div className="flex-1 overflow-y-auto p-6">
            {generatedDocument ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Document is Ready</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        await navigator.clipboard.writeText(generatedDocument);
                      }}
                      variant="outline"
                      className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={async () => {
                        const { exportToDocx } = await import('@/lib/docx-export');
                        await exportToDocx(generatedDocument, `legal-document-${Date.now()}.docx`);
                      }}
                      variant="outline"
                      className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Word
                    </Button>
                    <Button
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Legal Document</title>
                                <style>
                                  body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                  pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
                                </style>
                              </head>
                              <body>
                                <pre>${generatedDocument}</pre>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }}
                      variant="outline"
                      className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedDocument(null);
                        setShowAgreementWorkflow(false);
                      }}
                      variant="outline"
                      className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Chat
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedDocument(null);
                        // Keep workflow open for new document
                      }}
                      className="bg-white text-black hover:bg-neutral-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Document
                    </Button>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8">
                  <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                    {generatedDocument}
                  </pre>
                </div>
              </div>
            ) : (
              <AgreementWorkflow 
                onDocumentGenerated={handleDocumentGenerated}
                onBack={() => {
                  setShowAgreementWorkflow(false);
                  setGeneratedDocument(null);
                }}
              />
            )}
          </div>
        ) : currentSession ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="relative text-center text-neutral-400 mt-12">
                  {/* Animated Background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full animate-pulse"></div>
                    <div className="absolute top-32 right-20 w-24 h-24 bg-green-500/5 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-purple-500/5 rounded-full animate-pulse delay-2000"></div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="relative z-10">
                    {/* Logo and Title */}
                    <div className="mb-12 fade-in">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl mb-6 shadow-2xl shadow-amber-400/20">
                        <Scale className="w-12 h-12 text-black" />
                      </div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent mb-3">
                        Welcome to Legalify
                      </h1>
                      <p className="text-2xl text-neutral-300 mb-3 font-medium">Your AI Legal Assistant for Indian Law</p>
                      <p className="text-base text-neutral-400">Empowering justice for everyone, without expensive lawyers</p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                      <button 
                        onClick={() => setShowAgreementWorkflow(true)}
                        className="group glass-card card-hover glow-border p-8 rounded-2xl transition-all duration-300 border border-white/10 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-400/20"
                      >
                        <div className="bg-amber-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                          <FileText className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="font-bold mb-3 text-white group-hover:text-amber-300 transition-colors text-lg">Draft Agreements</h3>
                        <p className="text-base text-neutral-400 leading-relaxed">Create professional legal agreements with guided questions</p>
                      </button>
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group glass-card card-hover glow-border p-8 rounded-2xl transition-all duration-300 border border-white/10 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-400/20"
                      >
                        <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                          <Upload className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors text-lg">Analyze Documents</h3>
                        <p className="text-base text-neutral-400 leading-relaxed">Upload PDFs or images for instant legal analysis</p>
                      </button>
                      
                      <div className="group glass-card card-hover p-8 rounded-2xl border border-white/10">
                        <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110">
                          <MessageSquare className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="font-bold mb-3 text-white text-lg">Legal Guidance</h3>
                        <p className="text-base text-neutral-400 leading-relaxed">Get expert advice based on Indian legal standards</p>
                      </div>
                    </div>

                    {/* Quick Start Examples */}
                    <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto border border-white/10 shadow-2xl">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" /> Try asking:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-amber-400/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-amber-400 font-medium">"I need a land owner-builder agreement"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-emerald-400/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-emerald-400 font-medium">"What should I do about this court notice?"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-blue-400 font-medium">"Draft a rental agreement"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-orange-400/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-orange-400 font-medium">"Explain this legal document"</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center space-x-12 mt-12 text-base text-neutral-400">
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">24/7</div>
                        <div className="font-medium">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Free</div>
                        <div className="font-medium">Legal Help</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Indian</div>
                        <div className="font-medium">Law Expert</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
                    <div className={`max-w-3xl p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-amber-500/20' 
                        : 'glass-card text-white border border-white/10 shadow-xl'
                    }`}>
                      <div className="whitespace-pre-wrap font-medium leading-relaxed">{message.content}</div>
                      {message.content.includes('Agreement Generated Successfully') && (
                        <Button 
                          onClick={downloadDocument}
                          className="premium-button mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Document
                        </Button>
                      )}
                      <div className="text-xs opacity-70 mt-3 font-medium">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start fade-in">
                  <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400/30 border-t-amber-400"></div>
                      <span className="font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-6 bg-gradient-to-r from-black/50 to-neutral-900/50 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-4">
                <Button
                  onClick={() => setShowAgreementWorkflow(true)}
                  variant="outline"
                  size="sm"
                  className="premium-button bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-amber-400 text-black text-sm font-semibold rounded-xl shadow-lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Draft Agreement
                </Button>
                <span className="text-neutral-400 text-sm font-medium">Quick actions</span>
              </div>
              
              <PromptInputBox
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask about legal documents, upload files, or request document drafting..."
              />
            </div>
          </>
        ) : null
        }
        
        {!currentSession && !showAgreementWorkflow && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-neutral-400 fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <MessageSquare className="w-10 h-10" />
              </div>
              <p className="text-xl font-medium mb-2">Select a chat or create a new one to get started</p>
              <p className="text-base text-neutral-500">Your legal assistant is ready to help</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}