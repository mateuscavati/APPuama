import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.senhaHash, salt);
    return this.prisma.usuario.create({
      data: {
        ...createUserDto,
        senhaHash: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
        select: {
            id: true,
            nomeCompleto: true,
            email: true,
            matricula: true,
            posicaoEquipe: true,
            isAdmin: true,
            isAprovado: true,
        }
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        matricula: true,
        posicaoEquipe: true,
        isAdmin: true,
        isAprovado: true,
    }
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  
  async findByEmail(email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.senhaHash) {
        const salt = await bcrypt.genSalt();
        updateUserDto.senhaHash = await bcrypt.hash(updateUserDto.senhaHash, salt);
    }
    return this.prisma.usuario.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
