import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    // Kafka client owned by this module — PaymentsService emits payment events
    ClientsModule.registerAsync([{
      name: 'KAFKA_CLIENT',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: config.get<string>('KAFKA_CLIENT_ID', 'payments-service'),
            brokers: (config.get<string | string[]>('KAFKA_BROKERS', 'localhost:9092') as string)
              .toString().split(',').map((b) => b.trim()),
          },
          producer: { allowAutoTopicCreation: true },
        },
      }),
    }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
