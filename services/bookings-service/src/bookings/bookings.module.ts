import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './booking.entity';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity]),
    // Kafka client owned by this module — BookingsService emits booking events
    ClientsModule.registerAsync([{
      name: 'KAFKA_CLIENT',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: config.get<string>('KAFKA_CLIENT_ID', 'bookings-service'),
            brokers: (config.get<string | string[]>('KAFKA_BROKERS', 'localhost:9092') as string)
              .toString().split(',').map((b) => b.trim()),
          },
          producer: { allowAutoTopicCreation: true },
        },
      }),
    }]),
    // ShiftsModule provides ShiftsService to populate Kafka event payloads
    ShiftsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
