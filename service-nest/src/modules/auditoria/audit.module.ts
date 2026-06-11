import { Module } from '@nestjs/common';
import { AuditResolver } from './audit.resolver';
import { AuditService } from './repository/audit.service';

@Module({

  providers: [

    AuditResolver,

    AuditService,

  ],

})
export class AuditModule {}