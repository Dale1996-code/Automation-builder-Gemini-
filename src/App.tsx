/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code2, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { createChat } from './lib/gemini';
import { cn } from './lib/utils';
import { GenerateContentResponse } from '@google/genai';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your expert automation engineer. Describe a task or goal you want to automate, and I will write a complete, ready-to-run script for you. What would you like to automate today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<ReturnType<typeof createChat> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createChat();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMessageId, role: 'user', text: userText }]);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '', isStreaming: true }]);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: userText });
      
      let fullText = '';
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            fullText += c.text;
            setMessages(prev => 
            prev.map(msg => 
                msg.id === modelMessageId 
                ? { ...msg, text: fullText } 
                : msg
            )
            );
        }
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, text: "Sorry, I encountered an error while generating the script. Please try again.", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AutoScript AI</h1>
            <p className="text-sm text-gray-500">Expert Automation Engineer</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Gemini 3.1 Pro</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                message.role === 'user' ? "bg-gray-900" : "bg-blue-600"
              )}>
                {message.role === 'user' ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className={cn(
                "max-w-[85%] rounded-2xl px-5 py-4 shadow-sm",
                message.role === 'user' 
                  ? "bg-gray-900 text-white rounded-tr-none" 
                  : "bg-white border border-gray-200 rounded-tl-none"
              )}>
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                  <div className="prose prose-sm sm:prose-base max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-blue-600">
                    {message.text ? (
                      <Markdown>{message.text}</Markdown>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to automate... (e.g., 'Organize my downloads folder by file type')"
              className="flex-1 max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-900 placeholder-gray-500 outline-none"
              rows={1}
              style={{ height: 'auto' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1 mr-1 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              AutoScript AI can make mistakes. Please review scripts before running them.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
