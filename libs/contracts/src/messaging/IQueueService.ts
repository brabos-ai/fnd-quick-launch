/**
 * Queue options for task enqueuing
 */
export interface QueueOptions {
  /**
   * Number of retry attempts if task fails
   */
  retries?: number;

  /**
   * Optional callback URL for task completion notification
   */
  callbackUrl?: string;
}

/**
 * Cloud-agnostic interface for task queue service
 * Abstracts underlying queue implementations (QStash, BullMQ, SQS, etc.)
 */
export interface IQueueService {
  /**
   * Enqueue a task for immediate processing
   * @param taskName - Name/identifier of the task to execute
   * @param payload - Task payload data
   * @param options - Optional queue configuration
   * @returns Promise resolving to unique message ID
   */
  enqueue(
    taskName: string,
    payload: object,
    options?: QueueOptions,
  ): Promise<string>;

  /**
   * Enqueue a task with delayed execution
   * @param taskName - Name/identifier of the task to execute
   * @param payload - Task payload data
   * @param delaySeconds - Delay in seconds before task execution
   * @returns Promise resolving to unique message ID
   */
  enqueueWithDelay(
    taskName: string,
    payload: object,
    delaySeconds: number,
  ): Promise<string>;
}
