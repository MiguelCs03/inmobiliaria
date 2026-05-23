import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
