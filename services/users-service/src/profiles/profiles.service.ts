import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepo: Repository<ProfileEntity>,
  ) {}

  async findByUserId(userId: string): Promise<ProfileEntity> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async createFromRegistration(data: {
    userId: string;
    email: string;
    fullName: string;
  }): Promise<ProfileEntity> {
    const profile = this.profileRepo.create(data);
    return this.profileRepo.save(profile);
  }

  async update(userId: string, updates: Partial<ProfileEntity>): Promise<ProfileEntity> {
    await this.profileRepo.update({ userId }, updates);
    return this.findByUserId(userId);
  }

  async search(params: {
    specialty?: string;
    lat?: number;
    lng?: number;
    maxDistanceKm?: number;
    page?: number;
    limit?: number;
  }) {
    const qb = this.profileRepo
      .createQueryBuilder('p')
      .where('p.is_available = true')
      .andWhere('p.verification_status = :status', { status: 'verified' });

    if (params.specialty) {
      qb.andWhere(':specialty = ANY(p.specialties)', {
        specialty: params.specialty,
      });
    }

    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
