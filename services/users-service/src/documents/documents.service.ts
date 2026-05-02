import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './document.entity';
import { StorageService } from '../storage/storage.service';
import { DocumentType, VerificationStatus } from '@syndeocare/shared-types';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly docRepo: Repository<DocumentEntity>,
    private readonly storage: StorageService,
  ) {}

  async findAllForUser(userId: string): Promise<DocumentEntity[]> {
    return this.docRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async uploadDocument(params: {
    userId: string;
    documentType: DocumentType;
    name: string;
    file: Buffer;
    mimeType: string;
    expiryDate?: Date;
  }): Promise<DocumentEntity> {
    const key = `documents/${params.userId}/${Date.now()}-${params.name}`;
    const fileUrl = await this.storage.upload(key, params.file, params.mimeType);

    const doc = this.docRepo.create({
      userId: params.userId,
      documentType: params.documentType,
      name: params.name,
      fileUrl,
      expiryDate: params.expiryDate,
    });

    return this.docRepo.save(doc);
  }

  async getSignedUrl(documentId: string, userId: string): Promise<string> {
    const doc = await this.docRepo.findOne({
      where: { id: documentId, userId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.storage.getSignedUrl(doc.fileUrl);
  }

  async updateStatus(
    documentId: string,
    status: VerificationStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<DocumentEntity> {
    await this.docRepo.update(documentId, {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
    });
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
