/**
 * PlanDeactivatedEvent
 *
 * Emitted when a plan is deactivated by a super admin.
 */
export class PlanDeactivatedEvent {
  constructor(
    public readonly planId: string,
    public readonly changedBy: string,
  ) {}
}
