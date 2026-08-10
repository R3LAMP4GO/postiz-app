export function getOAuthLoginRedirect(
  pathname: string,
  search: string,
  hasReloadHeader: boolean
): string | null {
  if (
    !hasReloadHeader ||
    pathname !== '/auth' ||
    !new URLSearchParams(search).has('provider')
  ) {
    return null;
  }

  return '/launches';
}
