import { getCookieUrlFromDomain } from './subdomain.management';

describe('getCookieUrlFromDomain', () => {
  it('uses a host-only cookie for Tailnet public-suffix hostnames', () => {
    expect(getCookieUrlFromDomain('https://minipc.tail36cf0b.ts.net')).toBe(
      'minipc.tail36cf0b.ts.net'
    );
  });

  it('shares cookies across a normal application domain', () => {
    expect(getCookieUrlFromDomain('https://postiz.douroagency.com')).toBe(
      '.douroagency.com'
    );
  });
});
