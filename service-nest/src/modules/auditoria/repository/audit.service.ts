import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuditService {

  async getAuditLogs() {

    const goUrl =
      process.env.GO_SERVICE_URL ||
      'http://host.docker.internal:3030';

    const response = await axios.get(
      `${goUrl}/audit-logs`,
    );

    return response.data;
  }
}