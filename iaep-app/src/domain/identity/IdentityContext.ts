export interface IdentityContext {
    id: string;         // Alias to identityId for backward compatibility
    identityId: string; // The True UUID
    email: string;
    full_name?: string;
    provider: 'firebase' | 'supabase' | 'orcid' | 'unknown';
    json_id?: string;   // Legacy JSON ID mapping if needed
    roles?: string[];
    permissions?: string[];
}
