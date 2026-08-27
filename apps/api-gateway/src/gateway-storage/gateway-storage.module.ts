import { Module } from '@nestjs/common';
import { GatewayStorageController } from './gateway-storage.controller';
import { GatewayStorageService } from './gateway-storage.service';

@Module({
  controllers: [GatewayStorageController],
  providers: [GatewayStorageService],
  exports: [GatewayStorageService],
})
export class GatewayStorageModule {}
