import { ApiResponse, ApiError } from '@/types/api/common';

/**
 * API configuration
 */
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || ''
    : '';

/**
 * Custom fetch wrapper with error handling
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/api${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error: ApiError = {
                success: false,
                error: data.error || 'An error occurred',
                message: data.message,
                statusCode: response.status,
                timestamp: new Date().toISOString(),
            };
            throw error;
        }

        return {
            success: true,
            data: data.data || data,
            message: data.message,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error; // Re-throw API errors
        }

        // Handle network errors
        const networkError: ApiError = {
            success: false,
            error: 'Network error',
            message: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 0,
            timestamp: new Date().toISOString(),
        };
        throw networkError;
    }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
    endpoint: string,
    data?: any
): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
    endpoint: string,
    data?: any
): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<T>(endpoint, { method: 'DELETE' });
}

/**
 * SWR fetcher function
 */
export async function swrFetcher<T>(url: string): Promise<T> {
    const response = await apiGet<T>(url);
    if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data');
    }
    return response.data!;
}

/**
 * Create API response helper
 */
export function createApiResponse<T>(
    data: T,
    message?: string
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create API error response helper
 */
export function createApiError(
    error: string,
    statusCode: number = 500,
    message?: string
): ApiError {
    return {
        success: false,
        error,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Handle API route errors consistently
 */
export function handleApiError(error: unknown): Response {
    console.error('API Error:', error);

    // Check if it's already an ApiError
    if (error && typeof error === 'object' && 'success' in error && 'statusCode' in error) {
        const apiError = error as ApiError;
        return Response.json(apiError, { status: apiError.statusCode });
    }

    const genericError = createApiError(
        'Internal server error',
        500,
        error instanceof Error ? error.message : 'Unknown error'
    );

    return Response.json(genericError, { status: 500 });
} 