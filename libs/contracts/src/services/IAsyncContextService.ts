/**
 * Interface for async context service that provides request-scoped context
 * using AsyncLocalStorage for automatic propagation across async operations.
 */
export interface IAsyncContextService {
  /**
   * Runs a callback within a new async context with the given requestId.
   * All async operations within this callback will have access to the requestId.
   */
  run<T>(requestId: string, callback: () => T | Promise<T>): T | Promise<T>;

  /**
   * Gets the current requestId from the async context.
   * Returns undefined if called outside of an async context.
   */
  getRequestId(): string | undefined;

  /**
   * Gets the full context store.
   * Returns undefined if called outside of an async context.
   */
  getStore(): AsyncContextStore | undefined;
}

/**
 * Store structure for async context.
 */
export interface AsyncContextStore {
  requestId: string;
}
