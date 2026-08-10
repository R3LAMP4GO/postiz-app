import test from 'node:test';
import assert from 'node:assert/strict';
import { getOAuthLoginRedirect } from './oauth-callback.ts';

test('OAuth callback leaves /auth once when reload is requested', () => {
  assert.equal(
    getOAuthLoginRedirect('/auth', '?provider=GOOGLE&code=abc', true),
    '/launches'
  );
});

test('ordinary auth requests do not redirect through the OAuth guard', () => {
  assert.equal(
    getOAuthLoginRedirect('/auth', '?provider=GOOGLE&code=abc', false),
    null
  );
  assert.equal(getOAuthLoginRedirect('/auth', '?code=abc', true), null);
  assert.equal(
    getOAuthLoginRedirect('/auth/login', '?provider=GOOGLE', true),
    null
  );
});
