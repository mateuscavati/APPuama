import { Prisma } from '@prisma/client';

export class ChecklistItem implements Prisma.ChecklistItemUncheckedCreateInput {
  id?: number;
  area: string;
  descricaoItem: string;
}
