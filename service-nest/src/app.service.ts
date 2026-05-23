import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hola microservicio de gestión de inmuebles!';
  }
}
