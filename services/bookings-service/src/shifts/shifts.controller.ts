import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, IsArray, Min, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MatchingEngineService, ProfessionalProfile } from '../matching/matching-engine.service';

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

export class MatchShiftsDto {
  @IsString() id: string;
  @IsString() roleType: string;
  @IsArray() @IsString({ each: true }) specialties: string[];
  @IsArray() @IsString({ each: true }) certifications: string[];
  @IsOptional() @IsNumber() @Type(() => Number) hourlyRateMin?: number;
  @IsOptional() @IsNumber() @Type(() => Number) hourlyRateMax?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLng?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxTravelDistanceKm?: number;
}

@ApiTags('Shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly matchingEngine: MatchingEngineService,
  ) {}

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

  /**
   * GET /shifts/match
   * Returns open shifts ranked by match score for the authenticated professional.
   * Query params mirror the ProfessionalProfile fields (role, specialties, etc.)
   */
  @Get('match')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ranked shifts for a professional using the matching engine' })
  async matchForProfessional(
    @Request() req: any,
    @Query('roleType') roleType: string,
    @Query('specialties') specialties: string,
    @Query('certifications') certifications: string,
    @Query('hourlyRateMin') hourlyRateMin?: string,
    @Query('hourlyRateMax') hourlyRateMax?: string,
    @Query('locationLat') locationLat?: string,
    @Query('locationLng') locationLng?: string,
    @Query('maxTravelDistanceKm') maxTravelDistanceKm?: string,
  ) {
    const profile: ProfessionalProfile = {
      id: req.user.sub,
      roleType: roleType ?? '',
      specialties: specialties ? specialties.split(',') : [],
      certifications: certifications ? certifications.split(',') : [],
      hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
      hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
      locationLat: locationLat ? Number(locationLat) : undefined,
      locationLng: locationLng ? Number(locationLng) : undefined,
      maxTravelDistanceKm: maxTravelDistanceKm ? Number(maxTravelDistanceKm) : undefined,
      isAvailable: true,
    };

    const { data: openShifts } = await this.shiftsService.findAll({ page: 1, limit: 200 });
    const scores = this.matchingEngine.scoreShiftsForProfessional(profile, openShifts);
    return { data: scores };
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
