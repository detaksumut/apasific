import test from 'node:test';
import assert from 'node:assert/strict';
import { ORCIDProvider } from '../../src/providers/orcid/ORCIDProvider';

test('ORCIDProvider resolves OAuth configuration from environment variables', () => {
  process.env.ORCID_CLIENT_ID = 'env-client-id';
  process.env.ORCID_CLIENT_SECRET = 'env-client-secret';
  process.env.ORCID_REDIRECT_URI = 'https://example.com/api/auth/orcid/callback';
  process.env.ORCID_ENVIRONMENT = 'production';

  const provider = new ORCIDProvider();

  assert.equal((provider as any).clientId, 'env-client-id');
  assert.equal((provider as any).clientSecret, 'env-client-secret');
  assert.equal((provider as any).redirectUri, 'https://example.com/api/auth/orcid/callback');
  assert.equal((provider as any).sandbox, false);
});
