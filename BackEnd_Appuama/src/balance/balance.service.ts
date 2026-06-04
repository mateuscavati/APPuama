import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { Prisma } from '@prisma/client'; // Import Prisma

@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBalanceDto: CreateBalanceDto) {
    const dataToCreate: Prisma.BalanceamentoCreateInput = {
      dataRegistro: createBalanceDto.dataRegistro ? new Date(createBalanceDto.dataRegistro) : undefined,
      pesoPiloto: createBalanceDto.pesoPiloto ? new Prisma.Decimal(createBalanceDto.pesoPiloto) : null,
      pesoRodaDianteiraE: new Prisma.Decimal(createBalanceDto.pesoRodaDianteiraE),
      pesoRodaDianteiraD: new Prisma.Decimal(createBalanceDto.pesoRodaDianteiraD),
      pesoRodaTraseiraE: new Prisma.Decimal(createBalanceDto.pesoRodaTraseiraE),
      pesoRodaTraseiraD: new Prisma.Decimal(createBalanceDto.pesoRodaTraseiraD),
      distDianteiraTraseira: createBalanceDto.distDianteiraTraseira ? new Prisma.Decimal(createBalanceDto.distDianteiraTraseira) : null,
      distEsquerdaDireita: createBalanceDto.distEsquerdaDireita ? new Prisma.Decimal(createBalanceDto.distEsquerdaDireita) : null,
      distDiagonal: createBalanceDto.distDiagonal ? new Prisma.Decimal(createBalanceDto.distDiagonal) : null,
      pesoTotalCarro: createBalanceDto.pesoTotalCarro ? new Prisma.Decimal(createBalanceDto.pesoTotalCarro) : null,
      carro: { connect: { id: createBalanceDto.carroId } },
    };

    return this.prisma.balanceamento.create({ data: dataToCreate });
  }

  findAll() {
    return this.prisma.balanceamento.findMany();
  }

  async findOne(id: number) {
    const balance = await this.prisma.balanceamento.findUnique({ where: { id } });
    if (!balance) {
      throw new NotFoundException(`Balance with ID ${id} not found`);
    }
    return balance;
  }

  update(id: number, updateBalanceDto: UpdateBalanceDto) {
    return this.prisma.balanceamento.update({
      where: { id },
      data: updateBalanceDto,
    });
  }

  remove(id: number) {
    return this.prisma.balanceamento.delete({ where: { id } });
  }

  async findLastByCarroId(carroId: number) {
    const lastBalance = await this.prisma.balanceamento.findFirst({
      where: { carroId },
      orderBy: { dataRegistro: 'desc' },
    });
    return lastBalance;
  }
}
