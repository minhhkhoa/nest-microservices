import { LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';

@Module({
  imports: [
    //- import logger module quản lý pino và ngữ cảnh correlation id
    LoggerModule,
  ],
  controllers: [InventoryServiceController],
  providers: [InventoryServiceService],
})
export class InventoryServiceModule {}
