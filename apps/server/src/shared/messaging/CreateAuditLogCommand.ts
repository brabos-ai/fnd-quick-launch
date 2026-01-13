import { AuditLog } from '@fnd/domain';

export class CreateAuditLogCommand {
  constructor(public readonly data: Omit<AuditLog, 'id' | 'createdAt'>) {}
}
