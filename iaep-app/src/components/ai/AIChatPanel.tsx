"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, LogIn } from 'lucide-react';
import { WELCOME_MESSAGE, WELCOME_MESSAGE_GUEST } from '@/lib/ai-chat/prompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  isLoggedIn: boolean;
  onLoginRequest?: () => void;
}

export default function AIChatPanel({ isLoggedIn, onLoginRequest }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: isLoggedIn ? WELCOME_MESSAGE : WELCOME_MESSAGE_GUEST }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mendapat respons dari APASIFIC AI.');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Maaf, APASIFIC AI sedang tidak dapat merespons. Silakan coba lagi.'
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch {
      setError('Gagal menghubungi server. Silakan coba lagi.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf, terjadi gangguan koneksi. Silakan coba lagi.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f8fafc' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3" style={{ padding: '16px 14px' }}>
        {/* Guest info banner */}
        {!isLoggedIn && (
          <div className="rounded-lg text-center" style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            fontSize: '12px', color: '#64748b', lineHeight: '1.5'
          }}>
            Mode Tampan — percakapan tidak disimpan.
            <button
              onClick={onLoginRequest}
              className="font-bold ml-1 cursor-pointer"
              style={{ color: '#c9a84c', background: 'none', border: 'none', padding: 0, fontSize: '12px' }}
            >
              Login
            </button>
            {' '}untuk menyimpan riwayat.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex flex-col ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
              style={{ maxWidth: '85%' }}>
              <span className="font-bold mb-1 mx-1" style={{
                fontSize: '10px', color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {isUser ? 'Anda' : 'APASIFIC AI'}
              </span>
              <div className="shadow-sm break-words"
                style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderTopRightRadius: isUser ? '4px' : '16px',
                  borderTopLeftRadius: isUser ? '16px' : '4px',
                  backgroundColor: isUser ? '#c9a84c' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  fontWeight: isUser ? '500' : '400',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col self-start items-start" style={{ maxWidth: '85%' }}>
            <span className="font-bold mb-1 mx-1" style={{
              fontSize: '10px', color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>APASIFIC AI</span>
            <div className="shadow-sm"
              style={{
                padding: '10px 14px',
                borderRadius: '16px',
                borderTopLeftRadius: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex', gap: '4px', alignItems: 'center'
              }}>
              <span className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#c9a84c', animation: 'bounce 1.4s infinite ease-in-out both'
              }} />
              <span className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#c9a84c', animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '-0.16s'
              }} />
              <span className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#c9a84c', animation: 'bounce 1.4s infinite ease-in-out both',
                animationDelay: '-0.32s'
              }} />
              <span className="ml-2" style={{ fontSize: '12px', color: '#64748b' }}>mengetik...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="bg-white flex items-center gap-2"
        style={{ padding: '12px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <input
          type="text"
          placeholder={isLoggedIn ? "Tanya tentang APASIFIC..." : "Tanya tentang APASIFIC... (tanpa login)"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-grow bg-white focus:outline-none transition-colors"
          style={{
            borderRadius: '9999px', padding: '10px 16px',
            border: '1px solid #e2e8f0', color: '#0f172a', backgroundColor: '#f8fafc',
            fontSize: '14px', fontWeight: '500'
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 outline-none disabled:opacity-50 disabled:hover:scale-100"
          style={{ width: '40px', height: '40px', backgroundColor: '#c9a84c', border: 'none' }}
          title="Kirim"
        >
          <Send className="w-[18px] h-[18px]" style={{ color: '#ffffff', marginLeft: '2px' }} />
        </button>
      </form>
    </div>
  );
}
