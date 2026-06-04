import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { BalanceModule } from './balance/balance.module';
import { ReportsModule } from './reports/reports.module';
import { ChecklistItemsModule } from './checklist-items/checklist-items.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CarsModule,
    BalanceModule,
    ReportsModule,
    ChecklistItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
