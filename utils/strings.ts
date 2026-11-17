/**
 * Remove protocol and trailing slash from URL
 * @param url
 */
export const readableUrl = (url: string): string =>
  url?.replace(/^https?:\/\//, '').replace(/\/$/, '')
