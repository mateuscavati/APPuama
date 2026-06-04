import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post()
  create(@Body() createBalanceDto: CreateBalanceDto) {
    return this.balanceService.create(createBalanceDto);
  }

  @Get()
  findAll() {
    return this.balanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.balanceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBalanceDto: UpdateBalanceDto) {
    return this.balanceService.update(id, updateBalanceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.balanceService.remove(id);
  }

  @Get('last/:carroId')
  async findLastByCarroId(@Param('carroId', ParseIntPipe) carroId: number) {
    const lastBalance = await this.balanceService.findLastByCarroId(carroId);
    return lastBalance || {};
  }
}
