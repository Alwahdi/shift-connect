import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { BaseEnvSchema, StorageEnvSchema, createConfigValidation } from '@syndeocare/shared-config';
import { ProfilesModule } from './profiles/profiles.module';
import { ClinicsModule } from './clinics/clinics.module';
import { DocumentsModule } from './documents/documents.module';
import { StorageModule } from './storage/storage.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: createConfigValidation(BaseEnvSchema.merge(StorageEnvSchema)),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: config.get<string>('KAFKA_CLIENT_ID', 'users-service'),
              brokers: config.get<string[]>('KAFKA_BROKERS', ['localhost:9092']),
            },
            producer: { allowAutoTopicCreation: true },
          },
        }),
      },
    ]),

    TerminusModule,
    StorageModule,
    ProfilesModule,
    ClinicsModule,
    DocumentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
