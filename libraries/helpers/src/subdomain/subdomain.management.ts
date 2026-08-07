import { parse } from 'tldts';

export function getCookieUrlFromDomain(domain: string) {
  const url = parse(domain);
  if (url.hostname?.endsWith('.ts.net')) {
    return url.hostname;
  }

  return url.domain ? '.' + url.domain : url.hostname!;
}
