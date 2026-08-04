const MEDIA_FIRST_PLATFORMS = new Set(['instagram', 'tiktok', 'youtube']);

export const getPlatformName = (identifier?: string) =>
  (identifier || '').split('-')[0].toLowerCase();

export const requiresMediaBeforeText = (identifier?: string) =>
  MEDIA_FIRST_PLATFORMS.has(getPlatformName(identifier));
