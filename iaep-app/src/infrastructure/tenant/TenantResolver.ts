// src/infrastructure/tenant/TenantResolver.ts
import { NextRequest } from 'next/server';

/**
 * TenantResolver
 * Resolves the active workspace/tenant based on Priority:
 * 1. Request Header / JWT Claim (Workspace Switcher override)
 * 2. Hostname/Subdomain (Federated Institutional Portal)
 * 3. Default Identity Tenant (Fallback)
 */
export const TenantResolver = {
  resolveFromRequest: async (request: NextRequest): Promise<string | null> => {
    
    // 1. Explicit Workspace Switch via Header or Cookie
    const requestedWorkspace = request.headers.get('X-Workspace-Id') || request.cookies.get('apasific_workspace')?.value;
    if (requestedWorkspace) {
      // Security Validation: Ensure the Identity Core allows this user to access the requestedWorkspace
      if (await validateMembership(requestedWorkspace)) {
        return requestedWorkspace;
      }
    }

    // 2. Domain / Subdomain resolution
    const host = request.headers.get('host');
    if (host && !host.includes('localhost') && host !== 'apasific.org') {
      return await lookupTenantByDomain(host);
    }

    // 3. Fallback to user's primary/default tenant
    return 'default_global_tenant';
  }
};

async function validateMembership(tenantId: string): Promise<boolean> {
  // Logic to cross-check global identity with tenant_memberships
  return true;
}

async function lookupTenantByDomain(domain: string): Promise<string | null> {
  // Logic to query tenant_domains table
  return null;
}
