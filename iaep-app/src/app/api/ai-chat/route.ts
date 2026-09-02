import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { AIChatService } from '@/services/ai-chat/AIChatService';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LOAD = 20;

export async function POST(req: Request) {
  try {
    // 1. Validate input first (applies to all users)
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Pesan terlalu panjang. Maksimal ${MAX_MESSAGE_LENGTH} karakter.` },
        { status: 400 }
      );
    }

    // 2. Auth check — optional (hybrid mode)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    // 3. Load history only for authenticated users
    let history: { role: 'user' | 'assistant'; content: string }[] = [];

    if (isAuthenticated) {
      const { data: historyRows } = await supabase
        .from('ai_chat_messages')
        .select('role, content')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_LOAD);

      history = (historyRows || []).reverse();
    }

    // 4. Generate AI response (same for both modes)
    const result = await AIChatService.generateResponse(message, history);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Maaf, APASIFIC AI sedang tidak dapat merespons. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    // 5. Save to database ONLY for authenticated users
    if (isAuthenticated) {
      const now = new Date().toISOString();
      await supabase.from('ai_chat_messages').insert([
        { user_id: user!.id, role: 'user', content: message, created_at: now },
        { user_id: user!.id, role: 'assistant', content: result.response, created_at: now }
      ]);
    }

    // 6. Return response (same shape for both modes)
    return NextResponse.json({ response: result.response });
  } catch (e: unknown) {
    console.error('[AI Chat API] Unexpected error:', e);
    return NextResponse.json(
      { error: 'Maaf, APASIFIC AI sedang tidak dapat merespons. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
