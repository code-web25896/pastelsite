const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const resolveProductImage = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/logo.webp';
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean.startsWith('/uploads/') && API_URL) {
    return `${API_URL}${clean}`;
  }
  if (clean.startsWith('uploads/') && API_URL) {
    return `${API_URL}/${clean}`;
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
};
