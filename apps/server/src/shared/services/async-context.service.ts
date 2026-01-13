import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { IAsyncContextService, AsyncContextStore } from '@fnd/contracts';

/**
 * Service that provides request-scoped context using AsyncLocalStorage.
 * Allows automatic propagation of requestId across async operations.
 */
@Injectable()
export class AsyncContextService implements IAsyncContextService {
  private readonly storage = new AsyncLocalStorage<AsyncContextStore>();

  run<T>(requestId: string, callback: () => T | Promise<T>): T | Promise<T> {
    return this.storage.run({ requestId }, callback);
  }

  getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }

  getStore(): AsyncContextStore | undefined {
    return this.storage.getStore();
  }
}
