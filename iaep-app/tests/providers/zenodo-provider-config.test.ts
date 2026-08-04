import test from 'node:test';
import assert from 'node:assert/strict';
import { ZenodoProvider } from '../../src/providers/zenodo/ZenodoProvider';

test('ZenodoProvider uses NEXT_PUBLIC_ZENODO_API_TOKEN when ZENODO_API_TOKEN is not set', () => {
  delete process.env.ZENODO_API_TOKEN;
  process.env.NEXT_PUBLIC_ZENODO_API_TOKEN = 'test-token-from-public-env';

  const provider = new ZenodoProvider();

  assert.equal((provider as any).apiToken, 'test-token-from-public-env');
});
