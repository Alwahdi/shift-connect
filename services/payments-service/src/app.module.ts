import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { PaymentsEnvSchema, createConfigValidation } from '@syndeocare/shared-config';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthController } from './health.controller';
import { JwtAuthModule } from '@syndeocare/shared-config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: createConfigValidation(PaymentsEnvSchema) }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ClientsModule.registerAsync([{
      name: 'KAFKA_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: config.get<string>('KAFKA_CLIENT_ID', 'payments-service'),
            brokers: config.get<string[]>('KAFKA_BROKERS', ['localhost:9092']),
          },
          producer: { allowAutoTopicCreation: true },
        },
      }),
    }]),

    JwtAuthModule,
    TerminusModule,
    PaymentsModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
