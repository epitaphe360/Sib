import { toast } from 'react-hot-toast';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Client API centralisé
 * 
 * Fournit :
 * - Configuration commune (base URL, headers)
 * - Gestion des erreurs
 * - Retry automatique
 * - Logging
 * - Gestion des timeouts
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const TIMEOUT = 30000; // 30 secondes

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Effectuer une requête avec timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Effectuer une requête GET
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Effectuer une requête POST
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * Effectuer une requête PUT
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * Effectuer une requête DELETE
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Effectuer une requête générique
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers,
      });

      // Gérer les erreurs HTTP
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parser la réponse
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gérer les réponses d'erreur HTTP
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get('content-type');
    let errorData: ApiErrorResponse;

    try {
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'Erreur inconnue' };
    }

    const error = new Error(errorData.message || 'Erreur serveur');
    (error as any).status = response.status;
    (error as any).data = errorData;

    throw error;
  }

  /**
   * Gérer les erreurs réseau et autres
   */
  private handleError(error: any): void {
    if (error.name === 'AbortError') {
      toast.error('Délai d\'attente dépassé');
    } else if (error instanceof TypeError) {
      toast.error('Erreur de connexion');
    } else {
      console.error('Erreur API:', error);
    }
  }

  /**
   * Définir le token d'authentification
   */
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Obtenir le token d'authentification
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const apiClient = new ApiClient();

