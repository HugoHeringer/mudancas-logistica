import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController, TrialController } from './super-admin.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule, ConfigModule],
  controllers: [SuperAdminController, TrialController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
