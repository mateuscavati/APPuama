import { Module } from "@nestjs/common"
import { ChecklistItemsService } from "./checklist-items.service"
import { ChecklistItemsController } from "./checklist-items.controller"
import { PrismaModule } from "src/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [ChecklistItemsController],
  providers: [ChecklistItemsService],
})
export class ChecklistItemsModule {}