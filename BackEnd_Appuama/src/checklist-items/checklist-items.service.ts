import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateChecklistItemDto } from "./dto/create-checklist-item.dto"

@Injectable()
export class ChecklistItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createChecklistItemDto: CreateChecklistItemDto) {
    return this.prisma.checklistItem.create({
      data: createChecklistItemDto,
    })
  }

  findAll() {
    return this.prisma.checklistItem.findMany()
  }

  findOne(id: number) {
    return this.prisma.checklistItem.findUnique({
      where: { id },
    })
  }

  remove(id: number) {
    return this.prisma.checklistItem.delete({
      where: { id },
    })
  }
}