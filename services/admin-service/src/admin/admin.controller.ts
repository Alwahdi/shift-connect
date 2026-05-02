import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole, VerificationStatus } from '@syndeocare/shared-types';

export class ReviewDocumentDto {
  @IsEnum(VerificationStatus) status: VerificationStatus;
  @IsOptional() @IsString() rejectionReason?: string;
}

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  @Get('stats')
  getStats() {
    return {
      message: 'Admin stats endpoint — connect to your DB aggregation queries here',
    };
  }

  @Get('users')
  listUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return { message: 'User list — implement repository aggregation query', page, limit };
  }

  @Patch('documents/:id/review')
  reviewDocument(
    @Param('id') id: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return { message: 'Document review — call users-service or shared DB', id, ...dto };
  }
}
