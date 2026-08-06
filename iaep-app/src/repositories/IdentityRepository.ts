export class IdentityRepository {
    private static getSupabaseAdmin() {
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        return createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
    }

    static async findIdentityByEmail(email: string): Promise<{ id: string; full_name?: string; role?: string } | null> {
        try {
            const supabaseAdmin = this.getSupabaseAdmin();
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, role')
                .ilike('email', email)
                .maybeSingle();

            if (profile && profile.id) {
                return { id: profile.id, full_name: profile.full_name, role: profile.role ?? undefined };
            }
        } catch (error) {
            console.error("IdentityRepository findIdentityByEmail failed:", error);
        }
        return null;
    }

    static async findIdentityFromSystemSettings(identifier: string): Promise<{ id: string; email: string; full_name?: string; role?: string } | null> {
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
                                full_name: matched.full_name,
                                role: matched.role ?? undefined
                            };
                        }
                    } catch(e) {}
                }
            }
        } catch (e) {}
        return null;
    }

    static async findResearcherIdentityByUserId(userId: string): Promise<{ id: string } | null> {
        const supabaseAdmin = this.getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('researcher_identities')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error("IdentityRepository findResearcherIdentityByUserId failed:", error);
        }
        return data;
    }

    static async createResearcherIdentity(userId: string, fullName: string): Promise<{ id: string } | null> {
        const supabaseAdmin = this.getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('researcher_identities')
            .insert({
                user_id: userId,
                full_name: fullName,
                verification_status: 'VERIFIED'
            })
            .select('id')
            .single();

        if (error) {
            console.error("IdentityRepository createResearcherIdentity failed:", error);
            throw error;
        }
        return data;
    }

    static async findResearcherIdentifier(provider: string, identifierValue: string): Promise<{ id: string; researcher_id: string } | null> {
        const supabaseAdmin = this.getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('researcher_identifiers')
            .select('id, researcher_id')
            .eq('provider', provider)
            .eq('identifier_value', identifierValue)
            .maybeSingle();

        if (error) {
            console.error("IdentityRepository findResearcherIdentifier failed:", error);
        }
        return data;
    }

    static async linkResearcherIdentifier(
        researcherId: string,
        provider: string,
        identifierType: string,
        identifierValue: string,
        status: string,
        source: string,
        metadata: any
    ): Promise<void> {
        const supabaseAdmin = this.getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('researcher_identifiers')
            .upsert({
                researcher_id: researcherId,
                provider,
                identifier_type: identifierType,
                identifier_value: identifierValue,
                verification_status: status,
                source,
                metadata
            }, { onConflict: 'provider, identifier_value' });

        if (error) {
            console.error("IdentityRepository linkResearcherIdentifier failed:", error);
            throw error;
        }
    }
}
