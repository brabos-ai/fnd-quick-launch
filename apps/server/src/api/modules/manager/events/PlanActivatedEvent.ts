/**
 * PlanActivatedEvent
 *
 * Emitted when a plan is activated by a super admin.
 */
export class PlanActivatedEvent {
  constructor(
    public readonly planId: string,
    public readonly changedBy: string,
  ) {}
}
