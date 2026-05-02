import { z } from 'zod';

// ─── Base env schema every service must satisfy ───────────────────────────────

export const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Kafka
  KAFKA_BROKERS: z
    .string()
    .transform((v) => v.split(',').map((s) => s.trim()))
    .default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().min(1),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export type BaseEnvType = z.infer<typeof BaseEnvSchema>;

// ─── Auth service env ─────────────────────────────────────────────────────────

export const AuthEnvSchema = BaseEnvSchema.extend({
  RESEND_API_KEY: z.string().min(1),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export type AuthEnvType = z.infer<typeof AuthEnvSchema>;

// ─── Storage env (used by users + bookings) ───────────────────────────────────

export const StorageEnvSchema = z.object({
  S3_ENDPOINT: z.string().url().optional(), // MinIO locally, omit for AWS S3
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET_NAME: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false), // true for MinIO
});

export type StorageEnvType = z.infer<typeof StorageEnvSchema>;

// ─── Payments env ─────────────────────────────────────────────────────────────

export const PaymentsEnvSchema = BaseEnvSchema.extend({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

export type PaymentsEnvType = z.infer<typeof PaymentsEnvSchema>;

// ─── Validation helper ────────────────────────────────────────────────────────

export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  config: Record<string, unknown>,
): z.infer<T> {
  const result = schema.safeParse(config);
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }
  return result.data;
}

// ─── NestJS config factory ────────────────────────────────────────────────────

export function createConfigValidation<T extends z.ZodTypeAny>(schema: T) {
  return (config: Record<string, unknown>): z.infer<T> => {
    return validateEnv(schema, config);
  };
}
