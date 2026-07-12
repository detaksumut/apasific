"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ChatMessage {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  message: string;
  created_at: string;
  users?: { full_name: string } | null;
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans no-print">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#c9a84c] to-[#a3802b] text-[#05050a] rounded-full shadow-[0_4px_25px_rgba(201,168,76,0.5)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group cursor-pointer border border-[#c9a84c]/50 outline-none"
          title="Buka Global Discussion"
        >
          <span className="absolute inset-0 rounded-full bg-[#c9a84c]/30 animate-ping pointer-events-none" />
          <MessageCircle className="w-7 h-7 fill-current" />
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
                  <MessageCircle className="w-5 h-5" style={{ color: '#c9a84c' }} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full" style={{ border: '2px solid #111120' }} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-wide" style={{ color: '#c9a84c' }}>Global Discussion</h4>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  Forum Terbuka APASIFIC
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

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ backgroundColor: '#f8fafc', padding: '20px 16px' }}>
            <div className="shadow-sm text-sm leading-relaxed font-medium self-start" style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', color: '#334155', maxWidth: '90%' }}>
              Selamat datang di Forum Global APASIFIC! Silakan berdiskusi atau bertanya bebas di sini.
            </div>
            
            {messages.map((msg) => {
              const isMine = user ? msg.user_id === user.id : msg.guest_name === guestName && !msg.user_id;
              const senderName = msg.user_id ? 'Registered User' : msg.guest_name || 'Guest';
              
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'self-end items-end' : 'self-start items-start'}`} style={{ maxWidth: '85%' }}>
                  <span className="font-bold mb-1 mx-1" style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{senderName}</span>
                  <div className="shadow-sm text-sm leading-relaxed break-words" 
                    style={{ 
                      padding: '12px 18px', 
                      borderRadius: '16px',
                      borderTopRightRadius: isMine ? '4px' : '16px',
                      borderTopLeftRadius: isMine ? '16px' : '4px',
                      backgroundColor: isMine ? '#c9a84c' : '#ffffff',
                      color: isMine ? '#ffffff' : '#334155',
                      border: isMine ? 'none' : '1px solid #e2e8f0',
                      fontWeight: isMine ? '500' : '400'
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
             <form onSubmit={handleSetGuestName} className="bg-white flex flex-col gap-2" style={{ padding: '16px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#64748b' }}>Silakan masukkan nama Anda</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama Anda..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-grow text-sm font-medium bg-white shadow-sm focus:outline-none"
                    style={{ borderRadius: '9999px', padding: '12px 20px', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    autoFocus
                  />
                  <button type="submit" className="rounded-full text-sm font-bold transition-colors shadow-md" style={{ padding: '12px 24px', backgroundColor: '#111120', color: '#c9a84c', border: 'none', cursor: 'pointer' }}>
                    OK
                  </button>
                </div>
             </form>
          ) : (
            <form onSubmit={handleStartChat} className="bg-white flex items-center gap-3" style={{ padding: '16px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow text-sm font-medium bg-white focus:outline-none transition-colors"
                style={{ borderRadius: '9999px', padding: '14px 20px', border: '1px solid #e2e8f0', color: '#0f172a', backgroundColor: '#f8fafc' }}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 outline-none disabled:opacity-50 disabled:hover:scale-100"
                style={{ width: '48px', height: '48px', backgroundColor: '#c9a84c', border: 'none' }}
                title="Kirim Pesan"
              >
                <Send className="w-5 h-5" style={{ color: '#ffffff', marginLeft: '2px' }} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
