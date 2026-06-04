import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCarDto: CreateCarDto) {
    return this.prisma.carro.create({ data: createCarDto });
  }

  findAll() {
    return this.prisma.carro.findMany();
  }

  async findOne(id: number) {
    const car = await this.prisma.carro.findUnique({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return car;
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return this.prisma.carro.update({
      where: { id },
      data: updateCarDto,
    });
  }

  remove(id: number) {
    return this.prisma.carro.delete({ where: { id } });
  }
}
