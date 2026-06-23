/**
 * Fetch wrapper with automatic error handling and retry logic
 *
 * Provides consistent error handling across the application for fetch calls
 */

export interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
    public data?: any
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Fetch with automatic error handling and retry logic
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make fetch request
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is OK
      if (!response.ok) {
        let errorData: any;
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch {
            errorData = await response.text();
          }
        } else {
          errorData = await response.text();
        }

        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response,
          errorData
        );
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as any;
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 408, 429
      if (error instanceof FetchError) {
        const status = error.status;
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          throw error;
        }
      }

      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError('Request timeout', 408);
      }

      // Retry with exponential backoff
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // All retries exhausted
      throw lastError;
    }
  }

  throw lastError || new Error('Unknown fetch error');
}

/**
 * GET request with error handling
 */
export async function get<T = any>(url: string, options?: FetchOptions): Promise<T> {
  return fetchWithErrorHandling<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request with error handling
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request with error handling
 */
export async function put<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  return fetchWithErrorHandling<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request with error handling
 */
export async function del<T = any>(url: string, options?: FetchOptions): Promise<T> {
  return fetchWithErrorHandling<T>(url, { ...options, method: 'DELETE' });
}
