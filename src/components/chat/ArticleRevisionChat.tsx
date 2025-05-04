import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Copy, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../contexts/ToastContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  copied?: boolean;
}

// Helper type to ensure correct role assignment
type UserMessage = Omit<Message, 'role'> & { role: 'user' };
type AssistantMessage = Omit<Message, 'role'> & { role: 'assistant' };

interface ArticleRevisionChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticleContent?: string;
}

const API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/d05682e6-efe3-4f84-b774-01d25cf1c4d7";

export function ArticleRevisionChat({ isOpen, onClose, initialArticleContent }: ArticleRevisionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4()); // Generate a unique session ID
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: uuidv4(),
          content: "Hello! I'm your article revision assistant. Paste your article text and let me know what changes you'd like me to help with.",
          role: 'assistant',
          timestamp: new Date(),
          copied: false
        }
      ];
      
      // If initialArticleContent is provided, add it as a user message
      if (initialArticleContent) {
        const userMessage: Message = {
          id: uuidv4(),
          content: initialArticleContent,
          role: 'user',
          timestamp: new Date(),
          copied: false
        };
        initialMessages.push(userMessage);
        
        // Add assistant response to the initial article content
        const assistantResponse: Message = {
          id: uuidv4(),
          content: "I've received your article. What kind of revisions would you like me to help with? For example, I can help with grammar, style, tone, conciseness, etc.",
          role: 'assistant',
          timestamp: new Date(),
          copied: false
        };
        initialMessages.push(assistantResponse);
      }
      
      setMessages(initialMessages);
    }
  }, [messages.length, initialArticleContent]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input field when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleCopyText = (id: string) => {
    const message = messages.find(msg => msg.id === id);
    if (message) {
      navigator.clipboard.writeText(message.content);
      // Update the copied state for this message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === id ? { ...msg, copied: true } : msg
        )
      );
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === id ? { ...msg, copied: false } : msg
          )
        );
      }, 2000);
      showToast('Text copied to clipboard!', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await queryAPI(input);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.text || 'Sorry, I could not process your request.',
        role: 'assistant',
        timestamp: new Date(),
        copied: false
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying API:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        copied: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const queryAPI = async (question: string) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        overrideConfig: {
          sessionId: sessionId,
          returnSourceDocuments: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="revision-chat" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Article Revision Assistant</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-lg ${message.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-xs ${message.role === 'user' ? 'text-primary-50' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyText(message.id)}
                        className="text-gray-500 hover:text-primary transition-colors ml-2 p-1 rounded"
                        title="Copy to clipboard"
                      >
                        {message.copied ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your article text or type a message..."
                  className="w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary p-3 min-h-[80px] max-h-[160px] resize-y"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary-hover text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
