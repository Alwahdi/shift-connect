import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftEntity } from './shift.entity';

@Injectable()
export class ShiftsService {
  private readonly logger = new Logger(ShiftsService.name);

  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepo: Repository<ShiftEntity>,
  ) {}

  async create(clinicId: string, data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    const shift = this.shiftRepo.create({ ...data, clinicId });
    return this.shiftRepo.save(shift);
  }

  async findAll(params: {
    role?: string;
    date?: string;
    isUrgent?: boolean;
    page?: number;
    limit?: number;
  }) {
    const qb = this.shiftRepo
      .createQueryBuilder('s')
      .where('s.is_filled = false')
      .andWhere('s.shift_date >= CURRENT_DATE');

    if (params.role) qb.andWhere('s.role_required ILIKE :role', { role: `%${params.role}%` });
    if (params.date) qb.andWhere('s.shift_date = :date', { date: params.date });
    if (params.isUrgent !== undefined) qb.andWhere('s.is_urgent = :isUrgent', { isUrgent: params.isUrgent });

    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    qb.orderBy('s.shift_date', 'ASC').addOrderBy('s.start_time', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<ShiftEntity> {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, clinicId: string, updates: Partial<ShiftEntity>): Promise<ShiftEntity> {
    const shift = await this.findOne(id);
    if (shift.clinicId !== clinicId) throw new ForbiddenException('Not your shift');
    Object.assign(shift, updates);
    return this.shiftRepo.save(shift);
  }

  async delete(id: string, clinicId: string): Promise<void> {
    const shift = await this.findOne(id);
    if (shift.clinicId !== clinicId) throw new ForbiddenException('Not your shift');
    await this.shiftRepo.delete(id);
  }
}
