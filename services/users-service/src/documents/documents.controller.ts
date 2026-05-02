import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DocumentType } from '@syndeocare/shared-types';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List my documents' })
  getMyDocuments(@Request() req: any) {
    return this.documentsService.findAllForUser(req.user.sub);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document' })
  async upload(
    @Request() req: any,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.documentsService.uploadDocument({
      userId: req.user.sub,
      documentType: dto.documentType,
      name: dto.name,
      file: file.buffer,
      mimeType: file.mimetype,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
    });
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Get signed download URL' })
  getSignedUrl(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.getSignedUrl(id, req.user.sub);
  }
}
