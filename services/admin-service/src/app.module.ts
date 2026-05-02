import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { BaseEnvSchema, createConfigValidation } from '@syndeocare/shared-config';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';
import { JwtAuthModule } from '@syndeocare/shared-config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: createConfigValidation(BaseEnvSchema) }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    JwtAuthModule,
    TerminusModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
