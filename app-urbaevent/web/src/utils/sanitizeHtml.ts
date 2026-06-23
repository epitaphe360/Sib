/**
 * HTML Sanitization Utility
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 * WCAG 2.1 Level AA compliant - preserves semantic HTML structure.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param dirty - The untrusted HTML content to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  options?: DOMPurify.Config
): string {
  // Default configuration - allows common HTML elements and attributes
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'hr',
      'sup', 'sub',
      'abbr', 'cite', 'q',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id',
      'width', 'height',
      'colspan', 'rowspan',
      'target', 'rel',
      'data-*', // Allow data attributes for accessibility
      'aria-*', // Allow ARIA attributes for accessibility
      'role', // Allow role attribute for accessibility
    ],
    ALLOW_DATA_ATTR: true,
    ALLOW_ARIA_ATTR: true,
    // Ensure links open safely
    ADD_ATTR: ['target', 'rel'],
    // Keep basic HTML structure
    KEEP_CONTENT: true,
    // Return DOM for manipulation
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  };

  // Merge with custom options if provided
  const config = options ? { ...defaultConfig, ...options } : defaultConfig;

  // Sanitize the HTML
  const clean = DOMPurify.sanitize(dirty, config);

  // Ensure external links have proper security attributes
  return clean.replace(
    /<a\s+([^>]*href="http[^"]*"[^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer">'
  );
}

/**
 * Sanitize HTML for article content (allows more formatting)
 */
export function sanitizeArticleContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'section', 'article',
      'hr',
      'sup', 'sub',
      'abbr', 'cite', 'q',
      'mark', 'small',
      'dl', 'dt', 'dd',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id',
      'width', 'height',
      'colspan', 'rowspan',
      'target', 'rel',
      'data-*',
      'aria-*',
      'role',
      'loading', // For lazy loading images
    ],
  });
}

/**
 * Sanitize HTML for user-generated content (more restrictive)
 */
export function sanitizeUserContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
    ],
    ALLOWED_ATTR: [
      'href', 'title',
      'target', 'rel',
    ],
    // Disallow data attributes for user content
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}
