// src/infrastructure/tenant/TenantContext.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: string;
  identityId: string;
  permissions: string[];
  locale: string;
  features: Record<string, boolean | string>;
}

/**
 * TenantContext
 * Utilizes AsyncLocalStorage to persist the tenant boundary throughout the lifecycle of a request,
 * guaranteeing zero data leakage across workspaces.
 */
export const tenantContextStorage = new AsyncLocalStorage<TenantContextData>();

export const TenantContext = {
  get: (): TenantContextData | undefined => {
    return tenantContextStorage.getStore();
  },
  
  runWithContext: <T>(context: TenantContextData, fn: () => T): T => {
    return tenantContextStorage.run(context, fn);
  },

  getCurrentTenantId: (): string => {
    const store = tenantContextStorage.getStore();
    if (!store) throw new Error('TENANT_CONTEXT_MISSING');
    return store.tenantId;
  }
};
