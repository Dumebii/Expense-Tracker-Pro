'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Send, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAdvisorPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I&apos;m your AI Financial Advisor. Start a conversation to get personalized financial advice based on your actual income and expense data.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-100px)] flex flex-col max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="text-yellow-500" /> AI Financial Advisor
        </h1>
        <p className="text-slate-600 mt-2">Start a conversation to get personalized financial advice</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 p-6 mb-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          placeholder="Ask me anything about your finances..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-600 transition-colors flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
