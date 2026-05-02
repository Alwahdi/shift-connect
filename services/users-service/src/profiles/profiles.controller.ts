import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

export class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString({ each: true }) specialties?: string[];
  @IsOptional() @IsNumber() @Type(() => Number) hourlyRate?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) locationLng?: number;
  @IsOptional() @IsString() locationAddress?: string;
  @IsOptional() @IsNumber() @Type(() => Number) maxTravelDistanceKm?: number;
}

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@Request() req: any) {
    return this.profilesService.findByUserId(req.user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search professionals' })
  search(
    @Query('specialty') specialty?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profilesService.search({ specialty, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findByUserId(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  updateMyProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(req.user.sub, dto);
  }
}
