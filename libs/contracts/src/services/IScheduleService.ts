import { ScheduleConfig } from '../scheduling';

export interface IScheduleService {
  scheduleJob(name: string, schedule: ScheduleConfig, handler: () => Promise<void>): Promise<void>;
  cancelJob(name: string): Promise<void>;
}