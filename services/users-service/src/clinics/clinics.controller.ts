import { Controller, Get, Patch, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicsService } from './clinics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

export class UpdateClinicDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() @Type(() => Number) locationLat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLng?: number;
  @IsOptional() @IsString() taxId?: string;
}

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyCLinic(@Request() req: any) {
    return this.clinicsService.findByUserId(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clinicsService.findById(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clinic profile' })
  update(@Request() req: any, @Body() dto: UpdateClinicDto) {
    return this.clinicsService.update(req.user.sub, dto);
  }
}
