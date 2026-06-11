import { Resolver, Query } from '@nestjs/graphql';
import { AuditService } from './repository/audit.service';
import { AuditLogsResponse } from './dto/audit.response';

@Resolver()
export class AuditResolver {

  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Query(
    () => AuditLogsResponse,
  )
  async auditLogs(): Promise<AuditLogsResponse> {

    const data =
      await this.auditService.getAuditLogs();

    return {

      success: true,

      message:
        'Logs obtenidos correctamente',

      data,

    };
  }
}