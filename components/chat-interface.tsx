"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { AgreementWorkflow } from '@/components/agreement-workflow';
import { Upload, Plus, MessageSquare, FileText, Download, Trash2, Copy, RotateCcw, ArrowLeft, Scale, Check, BookOpen, Menu, X, LogOut, User } from 'lucide-react';
import CinematicThemeSwitcher from '@/components/ui/cinematic-theme-switcher';
import TetrisLoading from '@/components/ui/tetris-loader';
import { FeatureButtons } from '@/components/feature-buttons';
import { UsageDashboard } from '@/components/usage-dashboard';

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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showDownloadButtons, setShowDownloadButtons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
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

    // Check if user is asking to download
    const downloadKeywords = ['download', 'save', 'export'];
    const isDownloadRequest = downloadKeywords.some(keyword => 
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

        // If user asked to download, find the longest assistant message (likely the document)
        if (isDownloadRequest) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await fetch(`/api/chat/messages?sessionId=${currentSession.id}`);
          if (response.ok) {
            const data = await response.json();
            const assistantMessages = data.messages.filter((m: ChatMessage) => m.role === 'assistant');
            // Find the message with the most content (likely the drafted document)
            const documentMessage = assistantMessages.reduce((longest: ChatMessage, current: ChatMessage) => 
              current.content.length > longest.content.length ? current : longest
            , assistantMessages[0]);
            if (documentMessage) {
              setShowDownloadButtons(prev => new Set(prev).add(documentMessage.id));
            }
          }
        }

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
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative inset-y-0 left-0 z-50 w-80 bg-neutral-100 dark:bg-neutral-900 flex flex-col shadow-2xl border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 md:translate-x-0`}>
        <div className="p-6 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Scale className="w-6 h-6 text-black dark:text-white" />
              </div>
              <span className="font-bold text-black dark:text-white text-xl">Legalify</span>
            </div>
            <CinematicThemeSwitcher />
          </div>
          <Button 
            onClick={createNewSession}
            className="premium-button w-full bg-white hover:bg-neutral-100 text-black font-semibold shadow-xl rounded-xl h-12 border border-neutral-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center text-black dark:text-neutral-400 mt-12 fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 opacity-60" />
              </div>
              <p className="text-base font-medium">No chats yet</p>
              <p className="text-sm text-black dark:text-neutral-500 mt-1">Start a conversation to begin</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-black dark:text-neutral-400 font-medium">Chat History</span>
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
                      ? 'bg-white/10 dark:bg-neutral-800/50 border border-white/30 shadow-lg'
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
                        currentSession?.id === sessionItem?.id ? 'text-black dark:text-white' : 'text-black dark:text-neutral-300'
                      }`}>
                        {sessionItem?.title || 'Untitled Chat'}
                      </span>
                      <div className="text-xs text-black dark:text-neutral-500 mt-1 font-medium">
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
        
        {/* User Profile at Bottom */}
        {session?.user && (
          <div className="p-4 border-t border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-black dark:text-white font-bold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{session.user.name}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/signout', { method: 'POST' });
                window.location.href = '/auth/signin';
              }}
              className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="icon"
            className="text-black dark:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
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
          <div className="flex-1 flex flex-col">
            <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="relative text-center text-black dark:text-neutral-400 mt-12">
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
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-neutral-800 rounded-3xl mb-6 shadow-2xl">
                        <Scale className="w-12 h-12 text-black" />
                      </div>
                      <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                        Welcome to Legalify
                      </h1>
                      <p className="text-lg md:text-2xl text-black dark:text-neutral-300 mb-3 font-medium">Your AI Legal Assistant for Indian Law</p>
                      <p className="text-base text-black dark:text-neutral-400">Empowering justice for everyone, without expensive lawyers</p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                      <button 
                        onClick={() => setShowAgreementWorkflow(true)}
                        className="group glass-card card-hover glow-border p-8 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/50 hover:shadow-2xl"
                      >
                        <div className="bg-white/10 dark:bg-neutral-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold mb-3 text-white transition-colors text-lg">Draft Agreements</h3>
                        <p className="text-base text-black dark:text-neutral-400 leading-relaxed">Create professional legal agreements with guided questions</p>
                      </button>
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group glass-card card-hover glow-border p-8 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/50 hover:shadow-2xl"
                      >
                        <div className="bg-white/10 dark:bg-neutral-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold mb-3 text-white transition-colors text-lg">Analyze Documents</h3>
                        <p className="text-base text-black dark:text-neutral-400 leading-relaxed">Upload PDFs or images for instant legal analysis</p>
                      </button>
                      
                      <div className="group glass-card card-hover p-8 rounded-2xl border border-white/10">
                        <div className="bg-white/10 dark:bg-neutral-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                          <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold mb-3 text-white text-lg">Legal Guidance</h3>
                        <p className="text-base text-black dark:text-neutral-400 leading-relaxed">Get expert advice based on Indian legal standards</p>
                      </div>
                    </div>

                    {/* Quick Start Examples */}
                    <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto border border-white/10 shadow-2xl">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-white" /> Try asking:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-white font-medium">"I need a land owner-builder agreement"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-white font-medium">"What should I do about this court notice?"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-white font-medium">"Draft a rental agreement"</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10">
                          <span className="text-white font-medium">"Explain this legal document"</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center space-x-12 mt-12 text-base text-black dark:text-neutral-400">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">24/7</div>
                        <div className="font-medium">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">Free</div>
                        <div className="font-medium">Legal Help</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">Indian</div>
                        <div className="font-medium">Law Expert</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
                    <div className={`max-w-3xl p-6 rounded-2xl shadow-lg transition-all duration-300 relative group ${
                      message.role === 'user' 
                        ? 'bg-white dark:bg-neutral-800 text-black dark:text-white' 
                        : 'glass-card text-white border border-white/10 shadow-xl'
                    }`}>
                      <div className="whitespace-pre-wrap font-medium leading-relaxed text-black dark:text-white">{message.content}</div>
                      {message.role === 'assistant' && (
                        <>
                          <Button
                            onClick={async () => {
                              await navigator.clipboard.writeText(message.content);
                              setCopiedMessageId(message.id);
                              setTimeout(() => setCopiedMessageId(null), 2000);
                            }}
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          {showDownloadButtons.has(message.id) && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                onClick={async () => {
                                  const { exportToDocx } = await import('@/lib/docx-export');
                                  await exportToDocx(message.content, `document-${Date.now()}.docx`);
                                }}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Word
                              </Button>
                              <Button
                                onClick={() => {
                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>Document</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
                                          </style>
                                        </head>
                                        <body>
                                          <pre>${message.content}</pre>
                                        </body>
                                      </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.print();
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Download PDF
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                      <div className="text-xs opacity-70 mt-3 font-medium">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-center fade-in">
                  <TetrisLoading size="md" speed="normal" loadingText="Thinking..." />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4 md:p-6 bg-gradient-to-r from-black/50 to-neutral-900/50 backdrop-blur-xl">
              <FeatureButtons onFeatureClick={(feature) => {
                if (feature === 'dashboard') {
                  setShowDashboard(true);
                } else if (feature === 'research') {
                  setInputMessage('I need legal research on ');
                } else if (feature === 'memo') {
                  setInputMessage('Generate a legal memo on ');
                } else if (feature === 'argument') {
                  setInputMessage('Generate legal arguments for ');
                } else if (feature === 'review') {
                  setInputMessage('Review this document: ');
                } else if (feature === 'analyze') {
                  fileInputRef.current?.click();
                }
              }} />
              
              <PromptInputBox
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask about legal documents, upload files, or request document drafting..."
              />
            </div>
          </>
          </div>
        ) : null
        }
        
        {!currentSession && !showAgreementWorkflow && !showDashboard && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-black dark:text-neutral-400 fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <MessageSquare className="w-10 h-10" />
              </div>
              <p className="text-xl font-medium mb-2">Select a chat or create a new one to get started</p>
              <p className="text-base text-black dark:text-neutral-500">Your legal assistant is ready to help</p>
            </div>
          </div>
        )}

        {showDashboard && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black dark:text-white">Usage Dashboard</h2>
              <Button
                onClick={() => setShowDashboard(false)}
                variant="ghost"
                size="sm"
                className="text-black dark:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
            <UsageDashboard />
          </div>
        )}
      </div>
    </div>
  );
}