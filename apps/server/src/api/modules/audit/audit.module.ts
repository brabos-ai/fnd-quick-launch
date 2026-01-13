import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLogRepository } from '@fnd/database';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [
    AuditService,
    {
      provide: 'IAuditLogRepository',
      useClass: AuditLogRepository,
    },
  ],
  controllers: [AuditController],
})
export class AuditModule {}
