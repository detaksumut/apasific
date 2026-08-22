import { IdentityContext } from "@/domain/identity/IdentityContext";
import { IdentityNotFoundException } from "@/domain/identity/IdentityNotFoundException";
import { IdentityRepository } from "@/repositories/IdentityRepository";

export class IdentityResolver {
    /**
     * Resolves an authentication session user object into a verified IdentityContext.
     * Extracts legacy/fake UUIDs and normalizes them to True UUIDs.
     */
    static async resolve(sessionUser: any): Promise<IdentityContext> {
        if (!sessionUser || !sessionUser.id) {
            throw new IdentityNotFoundException("Session user or user ID is missing.");
        }

        const rawId = sessionUser.id;
        const email = sessionUser.email || '';
        const isTrueUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
        
        let identityId = rawId;
        let resolvedFullName = sessionUser.full_name || undefined;
        let resolvedEmail = email;
        let resolvedRole: string | undefined = undefined;

        // 1. Resolve Legacy / Fake UUIDs
        if (!isTrueUUID) {
            // Canonical coexistence rule:
            // Legacy production registry is authoritative during coexistence.
            if (resolvedEmail && !resolvedEmail.includes('fallback@')) {
                const registryProfile = await IdentityRepository.findIdentityFromSystemSettings(resolvedEmail);

console.log(
    "[IDENTITY-ROLE-DIAGNOSTIC]",
    "email=", resolvedEmail,
    "registryProfile=", JSON.stringify(registryProfile)
);

                if (registryProfile && registryProfile.id) {
                    identityId = registryProfile.id;
                    if (registryProfile.full_name) resolvedFullName = registryProfile.full_name;
                    if (registryProfile.email) resolvedEmail = registryProfile.email;
                    if (registryProfile.role) resolvedRole = registryProfile.role;
                } else {
                    // Profiles remain compatibility fallback only.
                    const profile = await IdentityRepository.findIdentityByEmail(resolvedEmail);

                    if (profile && profile.id) {
                        identityId = profile.id;
                        if (profile.full_name) resolvedFullName = profile.full_name;
                    } else {
                        throw new IdentityNotFoundException(`Identity not found for legacy email: ${resolvedEmail}`);
                    }
                }
            } else {
                // If email is missing or fallback, try searching by the raw legacy ID in system_settings
                let fallbackProfile = await IdentityRepository.findIdentityFromSystemSettings(rawId);
                
                // If not found by rawId, try json_id if it exists (very common for Firebase fallback users)
                if (!fallbackProfile && sessionUser.json_id) {
                    fallbackProfile = await IdentityRepository.findIdentityFromSystemSettings(sessionUser.json_id);
                }

                if (fallbackProfile && fallbackProfile.id) {
                    identityId = fallbackProfile.id;
                    if (fallbackProfile.full_name) resolvedFullName = fallbackProfile.full_name;
                    if (fallbackProfile.email) {
                        resolvedEmail = fallbackProfile.email;
                        
                        // Critical: Since we now have the real email, try to upgrade to True UUID!
                        const trueProfile = await IdentityRepository.findIdentityByEmail(resolvedEmail);
                        if (trueProfile && trueProfile.id) {
                            identityId = trueProfile.id;
                        }
                    }
                } else {
                    throw new IdentityNotFoundException(`Identity not found for legacy ID: ${rawId} (json_id: ${sessionUser.json_id || 'none'})`);
                }
            }
        } else {
            // True UUID:
            // Keep canonical UUID as identityId.
            // During coexistence, production registry is authoritative
            // for production role assignment.

            const profileById = await IdentityRepository.findIdentityById(rawId);

            if (profileById) {
                if (profileById.full_name) {
                    resolvedFullName = profileById.full_name;
                }

                if (profileById.email) {
                    resolvedEmail = profileById.email;
                }

                // Use profiles.role as a fallback — system_settings will override below if found
                if ((profileById as any).role) {
                    resolvedRole = (profileById as any).role;
                }

            }

            // Production registry overrides profiles.role during coexistence.
            // IMPORTANT: this changes only the role, never the canonical identityId.
            if (resolvedEmail && !resolvedEmail.includes("fallback@")) {
                const registryProfile =
                    await IdentityRepository.findIdentityFromSystemSettings(resolvedEmail);

                if (registryProfile) {
                    if (registryProfile.full_name) {
                        resolvedFullName = registryProfile.full_name;
                    }

                    if (registryProfile.email) {
                        resolvedEmail = registryProfile.email;
                    }

                    if (registryProfile.role) {
                        resolvedRole = registryProfile.role;
                    }
                }
            }

            // profiles.role is no longer used as a role source.
        }

        // Existing Super Admin configuration remains authoritative for the
        // designated Super Admin account.
        const configuredSuperAdminEmail =
            process.env.SUPER_ADMIN_CANONICAL_EMAIL ||
            process.env.SUPER_ADMIN_EMAIL;

        if (
            resolvedEmail &&
            configuredSuperAdminEmail &&
            resolvedEmail.toLowerCase() === configuredSuperAdminEmail.toLowerCase()
        ) {
            resolvedRole = "super_admin";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "danil@apasific.org") {
            resolvedRole = "supervisor";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "kadinmedan1@gmail.com") {
            resolvedRole = "editor";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "kun@apasific.org") {
            resolvedRole = "layout";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "rizky@apasific.org") {
            resolvedRole = "cover";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "parida@apasific.org") {
            resolvedRole = "publish";
        } else if (resolvedEmail && resolvedEmail.toLowerCase() === "arfanihksan@unimed.ac.id") {
            resolvedRole = "co-admin";
        }

        // 2. Build the new IdentityContext, do not mutate original sessionUser
        const context: IdentityContext = {
            id: identityId,         // Alias to identityId for backward compatibility
            identityId: identityId, // True UUID
            email: resolvedEmail,
            full_name: resolvedFullName,
            provider: sessionUser.app_metadata?.provider || (isTrueUUID ? 'supabase' : 'firebase'),
            // Canonical role authority: resolvedRole wins over provider metadata.
            // Production legacy roles must not be overridden by Supabase app_metadata.roles.
            roles: resolvedRole ? [resolvedRole] : (sessionUser.app_metadata?.roles || []),
            permissions: sessionUser.app_metadata?.permissions || []
        };

        return context;
    }
}


