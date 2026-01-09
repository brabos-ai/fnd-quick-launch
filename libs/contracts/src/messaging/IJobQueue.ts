export interface IJobQueue {
  add(jobName: string, data: any, options?: JobOptions): Promise<void>;
  process(jobName: string, handler: (data: any) => Promise<void>): Promise<void>;
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}