/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { parseAuthTokensFromUrl } from '../../../../apps/mobile/src/lib/authTokens';

describe('Mobile — authTokens', () => {
  it('parse tokens depuis hash', () => {
    const url = 'urbaevent://auth-callback#access_token=at&refresh_token=rt&type=magiclink';
    expect(parseAuthTokensFromUrl(url)).toEqual({
      accessToken: 'at',
      refreshToken: 'rt',
      type: 'magiclink',
      code: null,
    });
  });

  it('parse tokens depuis query', () => {
    const url = 'urbaevent://auth-callback?code=abc123';
    expect(parseAuthTokensFromUrl(url)).toEqual({
      accessToken: null,
      refreshToken: null,
      type: null,
      code: 'abc123',
    });
  });

  it('parse query vide', () => {
    expect(parseAuthTokensFromUrl('urbaevent://auth-callback?')).toEqual({
      accessToken: null,
      refreshToken: null,
      type: null,
      code: null,
    });
  });

  it('parse hash vide', () => {
    expect(parseAuthTokensFromUrl('urbaevent://auth-callback#')).toEqual({
      accessToken: null,
      refreshToken: null,
      type: null,
      code: null,
    });
  });

  it('parse query avant hash (hash prioritaire)', () => {
    expect(parseAuthTokensFromUrl('urbaevent://auth-callback?code=abc#access_token=at')).toEqual({
      accessToken: 'at',
      refreshToken: null,
      type: null,
      code: null,
    });
  });

  it('parse URL sans hash ni query', () => {
    expect(parseAuthTokensFromUrl('urbaevent://auth-callback')).toEqual({
      accessToken: null,
      refreshToken: null,
      type: null,
      code: null,
    });
  });
});
