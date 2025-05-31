/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        total?: number;
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: string;
        [key: string]: any;
    };
    timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
    success: false;
    error: string;
    message?: string;
    statusCode: number;
    timestamp: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationMeta;
}

/**
 * Search parameters
 */
export interface SearchParams {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for tools
 */
export interface ToolFilterParams extends SearchParams {
    tags?: string[];
    isActive?: boolean;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
    method: HttpMethod;
    path: string;
    requiresAuth?: boolean;
} 