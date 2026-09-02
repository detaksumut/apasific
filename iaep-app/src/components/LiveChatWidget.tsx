"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, MessageCircle, Bot } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import AIChatPanel from '@/components/ai/AIChatPanel';

interface ChatMessage {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  message: string;
  created_at: string;
  users?: { full_name: string } | null;
}

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'ai'>('global');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guestName, setGuestName] = useState('');
  const [isAskingName, setIsAskingName] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Load guest name from local storage if exists
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('apasific_guest_name');
      if (storedName) setGuestName(storedName);
    }
  }, []);

  // Fetch initial messages and subscribe to real-time changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      // In Supabase, if we want to join with a public profile table, we need to make sure the users table is accessible.
      // Assuming 'profiles' or 'users' is used. Let's try 'profiles' first, or fallback to 'users' if APASIFIC uses 'users'.
      // Looking at RJRAKP it used 'users', but APASIFIC might use 'profiles' as per standard or 'users' as well.
      // We will select 'users ( full_name )' first, if it fails, we ignore joined data.
      const { data, error } = await supabase
        .from('global_chats')
        .select(`
          id, user_id, guest_name, message, created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (data && !error) {
        setMessages(data.reverse() as ChatMessage[]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('public:global_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_chats' },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Guest name prompt logic
    if (!user && !guestName) {
      setIsAskingName(true);
      return;
    }

    const currentMsg = message;
    setMessage(''); // Optimistic clear
    
    const { error } = await supabase.from('global_chats').insert([
      {
        user_id: user ? user.id : null,
        guest_name: user ? null : guestName,
        message: currentMsg
      }
    ]);

    if (error) {
      console.error("Error sending message detail:", error);
      alert("Error sending message: " + (error.message || JSON.stringify(error)));
      setMessage(currentMsg); // Revert on error
    }
  };

  const handleSetGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('apasific_guest_name', guestName);
    }
    setIsAskingName(false);
    handleStartChat(e); // Proceed sending the message
  };

  if (pathname !== '/') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans no-print">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#c9a84c] to-[#a3802b] text-[#25D366] rounded-full shadow-[0_4px_25px_rgba(201,168,76,0.5)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group cursor-pointer border border-[#c9a84c]/50 outline-none"
          title="Buka Global Discussion"
        >
          <span className="absolute inset-0 rounded-full bg-[#c9a84c]/30 animate-ping pointer-events-none" />
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative">
            <MessageCircle className="w-[46px] h-[46px] fill-current" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] text-[10px] font-bold text-white z-10 pointer-events-none tracking-wide">Chat</span>
          </div>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300 text-left h-[500px] max-h-[80vh]" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
          
          {/* Header */}
          <div className="text-white p-4 flex items-center justify-between relative" style={{ background: 'linear-gradient(to right, #05050a, #111120, #05050a)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(201,168,76,0.5)' }}>
                  {activeTab === 'global' ? (
                    <MessageCircle className="w-5 h-5" style={{ color: '#c9a84c' }} />
                  ) : (
                    <Bot className="w-5 h-5" style={{ color: '#c9a84c' }} />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full" style={{ border: '2px solid #111120' }} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-wide" style={{ color: '#c9a84c' }}>
                  {activeTab === 'global' ? 'Global Discussion' : 'APASIFIC AI'}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  {activeTab === 'global' ? 'Forum Terbuka APASIFIC' : 'Research & Publishing Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors cursor-pointer border-none bg-transparent outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
            <button
              onClick={() => setActiveTab('global')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-all cursor-pointer border-none outline-none"
              style={{
                backgroundColor: activeTab === 'global' ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: activeTab === 'global' ? '#c9a84c' : '#64748b',
                borderBottom: activeTab === 'global' ? '2px solid #c9a84c' : '2px solid transparent'
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Global Discussion
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-all cursor-pointer border-none outline-none"
              style={{
                backgroundColor: activeTab === 'ai' ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: activeTab === 'ai' ? '#c9a84c' : '#64748b',
                borderBottom: activeTab === 'ai' ? '2px solid #c9a84c' : '2px solid transparent'
              }}
            >
              <Bot className="w-3.5 h-3.5" />
              APASIFIC AI
            </button>
          </div>

          {/* Content Area — Tab: Global Discussion */}
          {activeTab === 'global' && (
            <>
              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3" style={{ backgroundColor: '#f8fafc', padding: '16px 14px' }}>
                <div className="shadow-sm self-start" style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', color: '#1e293b', maxWidth: '90%', fontSize: '14px', lineHeight: '1.6', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                  Selamat datang di Forum Global APASIFIC! Silakan berdiskusi atau bertanya bebas di sini.
                </div>
                
                {messages.map((msg) => {
                  const isMine = user ? msg.user_id === user.id : msg.guest_name === guestName && !msg.user_id;
                  const senderName = msg.user_id ? 'Registered User' : msg.guest_name || 'Guest';
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'self-end items-end' : 'self-start items-start'}`} style={{ maxWidth: '85%' }}>
                      <span className="font-semibold mb-1 mx-1" style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{senderName}</span>
                      <div className="shadow-sm break-words" 
                        style={{ 
                          padding: '10px 14px', 
                          borderRadius: '16px',
                          borderTopRightRadius: isMine ? '4px' : '16px',
                          borderTopLeftRadius: isMine ? '16px' : '4px',
                          backgroundColor: isMine ? '#c9a84c' : '#ffffff',
                          color: isMine ? '#ffffff' : '#1e293b',
                          border: isMine ? 'none' : '1px solid #e2e8f0',
                          fontWeight: isMine ? '500' : '400',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer / Form */}
              {isAskingName ? (
                <form onSubmit={handleSetGuestName} className="bg-white flex flex-col gap-2" style={{ padding: '12px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                  <p className="font-medium" style={{ fontSize: '13px', color: '#475569' }}>Silakan masukkan nama Anda</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama Anda..."
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="flex-grow font-medium bg-white shadow-sm focus:outline-none"
                      style={{ borderRadius: '9999px', padding: '10px 16px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '14px' }}
                      autoFocus
                    />
                    <button type="submit" className="rounded-full text-[13px] font-bold transition-colors shadow-md" style={{ padding: '10px 20px', backgroundColor: '#111120', color: '#c9a84c', border: 'none', cursor: 'pointer' }}>
                      OK
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStartChat} className="bg-white flex items-center gap-2" style={{ padding: '12px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                  <input
                    type="text"
                    placeholder="Tulis pesan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow font-medium bg-white focus:outline-none transition-colors"
                    style={{ borderRadius: '9999px', padding: '10px 16px', border: '1px solid #e2e8f0', color: '#0f172a', backgroundColor: '#f8fafc', fontSize: '14px' }}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 outline-none disabled:opacity-50 disabled:hover:scale-100"
                    style={{ width: '40px', height: '40px', backgroundColor: '#c9a84c', border: 'none' }}
                    title="Kirim Pesan"
                  >
                    <Send className="w-[18px] h-[18px]" style={{ color: '#ffffff', marginLeft: '2px' }} />
                  </button>
                </form>
              )}
            </>
          )}

          {/* Content Area — Tab: APASIFIC AI */}
          {activeTab === 'ai' && (
            <div className="flex-1 overflow-hidden">
              <AIChatPanel
                isLoggedIn={!!user}
                onLoginRequest={() => {
                  window.location.href = '/auth/login';
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
