export class IdentityRepository {
    private static getSupabaseAdmin() {
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        return createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
    }

    static async findIdentityByEmail(email: string): Promise<{ id: string; full_name?: string } | null> {
        try {
            const supabaseAdmin = this.getSupabaseAdmin();
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .ilike('email', email)
                .maybeSingle();

            if (profile && profile.id) {
                return { id: profile.id, full_name: profile.full_name };
            }
        } catch (error) {
            console.error("IdentityRepository findIdentityByEmail failed:", error);
        }
        return null;
    }

    static async findIdentityFromSystemSettings(identifier: string): Promise<{ id: string; email: string; full_name?: string } | null> {
        // Fallback to searching system_settings if profiles fails (for legacy hardcoded users)
        try {
            const supabaseAdmin = this.getSupabaseAdmin();
            const { data: settings } = await supabaseAdmin
                .from('system_settings')
                .select('value')
                .in('key', ['apasific_registered_users', 'registered_users']);
                
            if (settings) {
                for (const s of settings) {
                    try {
                        const users = Array.isArray(s.value) ? s.value : JSON.parse(s.value);
                        const matched = users.find((u: any) => u.id === identifier || u.email?.toLowerCase() === identifier.toLowerCase());
                        if (matched && matched.email) {
                            return {
                                id: matched.id,
                                email: matched.email,
                                full_name: matched.full_name
                            };
                        }
                    } catch(e) {}
                }
            }
        } catch (e) {}
        return null;
    }
}
