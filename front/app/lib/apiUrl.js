/**
 * Get the API URL with /api suffix
 * Ensures the URL always ends with /api regardless of env var configuration
 */
export const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

/**
 * Get the base URL without /api suffix (for WebSocket connections, etc.)
 */
export const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return baseUrl.replace(/\/api$/, "");
};
