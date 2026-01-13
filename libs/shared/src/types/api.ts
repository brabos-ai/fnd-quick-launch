/**
 * API Response Types
 *
 * Standard envelope format for API responses.
 * All successful API responses follow this pattern for consistency.
 */

/**
 * Pagination metadata for list responses
 *
 * @property total - Total number of items across all pages
 * @property page - Current page number (1-indexed)
 * @property limit - Number of items per page
 * @property totalPages - Total number of pages
 * @property hasNextPage - Whether there is a next page
 * @property hasPrevPage - Whether there is a previous page
 * @property timestamp - Optional timestamp when response was generated
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  timestamp?: string;
}

/**
 * Standard API response envelope for single resources
 *
 * @template T - Type of the data being returned
 * @property data - The actual response data
 * @property meta - Optional metadata (e.g., timestamp)
 *
 * @example
 * // Single user response
 * const response: ApiResponse<User> = {
 *   data: { id: '123', email: 'user@example.com', ... },
 *   meta: { timestamp: '2026-01-12T10:00:00Z' }
 * }
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp?: string;
  };
}

/**
 * Standard API response envelope for paginated lists
 *
 * @template T - Type of items in the array
 * @property data - Array of items for current page
 * @property meta - Pagination metadata
 *
 * @example
 * // Paginated users list
 * const response: PaginatedResponse<User> = {
 *   data: [{ id: '1', ... }, { id: '2', ... }],
 *   meta: {
 *     total: 100,
 *     page: 1,
 *     limit: 10,
 *     totalPages: 10,
 *     hasNextPage: true,
 *     hasPrevPage: false,
 *     timestamp: '2026-01-12T10:00:00Z'
 *   }
 * }
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
