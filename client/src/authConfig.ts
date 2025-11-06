export const authConfig = {
  // OAuth/JWT configuration
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
  authority: process.env.NEXT_PUBLIC_AUTHORITY || '',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  
  // Token configuration
  tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes
  tokenExpiryBuffer: 60 * 1000, // 1 minute
  
  // Session configuration
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // API configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  
  // Cookie configuration
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost',
  cookieSecure: process.env.NODE_ENV === 'production',
  cookieSameSite: 'strict' as const,
};

export default authConfig;
