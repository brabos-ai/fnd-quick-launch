export interface ScheduleConfig {
  readonly type: string;
  toCronExpression(): string;
}

export class DailySchedule implements ScheduleConfig {
  readonly type = 'daily';

  constructor(private readonly hour: number, private readonly minute: number = 0) {
    if (hour < 0 || hour > 23) throw new Error('Hour must be between 0 and 23');
    if (minute < 0 || minute > 59) throw new Error('Minute must be between 0 and 59');
  }

  toCronExpression(): string {
    return `${this.minute} ${this.hour} * * *`;
  }
}

export class IntervalSchedule implements ScheduleConfig {
  readonly type = 'interval';

  constructor(private readonly intervalMinutes: number) {
    if (intervalMinutes <= 0) throw new Error('Interval must be greater than 0');
  }

  toCronExpression(): string {
    return `*/${this.intervalMinutes} * * * *`;
  }
}

export class WeeklySchedule implements ScheduleConfig {
  readonly type = 'weekly';

  constructor(
    private readonly dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
    private readonly hour: number,
    private readonly minute: number = 0
  ) {
    if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error('Day of week must be between 0 and 6');
    if (hour < 0 || hour > 23) throw new Error('Hour must be between 0 and 23');
    if (minute < 0 || minute > 59) throw new Error('Minute must be between 0 and 59');
  }

  toCronExpression(): string {
    return `${this.minute} ${this.hour} * * ${this.dayOfWeek}`;
  }
}

export class CronSchedule implements ScheduleConfig {
  readonly type = 'cron';

  constructor(private readonly cronExpression: string) {
    if (!cronExpression?.trim()) throw new Error('Cron expression cannot be empty');
  }

  toCronExpression(): string {
    return this.cronExpression;
  }
}