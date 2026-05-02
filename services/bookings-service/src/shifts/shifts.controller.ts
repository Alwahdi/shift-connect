import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

export class CreateShiftDto {
  @IsString() title: string;
  @IsString() roleRequired: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() shiftDate: string;
  @IsString() startTime: string;
  @IsString() endTime: string;
  @IsNumber() @Type(() => Number) hourlyRate: number;
  @IsOptional() @IsArray() @IsString({ each: true }) requiredCertifications?: string[];
  @IsOptional() @IsString() locationAddress?: string;
  @IsOptional() @IsNumber() @Type(() => Number) locationLat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLng?: number;
  @IsOptional() @IsBoolean() isUrgent?: boolean;
  @IsOptional() @IsNumber() @Type(() => Number) @Min(1) maxApplicants?: number;
}

@ApiTags('Shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  findAll(
    @Query('role') role?: string,
    @Query('date') date?: string,
    @Query('isUrgent') isUrgent?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.shiftsService.findAll({ role, date, isUrgent, page, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Request() req: any, @Body() dto: CreateShiftDto) {
    return this.shiftsService.create(req.user.sub, dto as any);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateShiftDto>,
  ) {
    return this.shiftsService.update(id, req.user.sub, dto as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.shiftsService.delete(id, req.user.sub);
  }
}
