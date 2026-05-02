import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicEntity } from './clinic.entity';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicRepo: Repository<ClinicEntity>,
  ) {}

  async findByUserId(userId: string): Promise<ClinicEntity> {
    const clinic = await this.clinicRepo.findOne({ where: { userId } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async findById(id: string): Promise<ClinicEntity> {
    const clinic = await this.clinicRepo.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async createFromRegistration(data: {
    userId: string;
    email: string;
    name: string;
  }): Promise<ClinicEntity> {
    const clinic = this.clinicRepo.create(data);
    return this.clinicRepo.save(clinic);
  }

  async update(userId: string, updates: Partial<ClinicEntity>): Promise<ClinicEntity> {
    await this.clinicRepo.update({ userId }, updates as any);
    return this.findByUserId(userId);
  }
}
