import "dotenv/config";

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DB: {
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD?: string;
    NAME: string;
  };
  REDIS: {
    HOST: string;
    PORT: number;
    PASSWORD?: string;
  };
  JWT_SECRET: string;
  REFRESH_TOKEN_DAYS: number;
  FRONTEND_URL: string;
  SMTP: {
    HOST: string;
    PORT: number;
    USER?: string;
    PASS?: string;
    FROM: string;
  } | null;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT || 9001),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT || 5432),
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "secret",
    NAME: process.env.DB_NAME || "my_db",
  },
  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: Number(process.env.REDIS_PORT || 6379),
    PASSWORD: process.env.REDIS_PASSWORD || undefined,
  },
  JWT_SECRET: process.env.JWT_SECRET || "mantakopi_jwt_secretkey_2026",
  REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS || 30),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  SMTP: process.env.SMTP_HOST
    ? {
        HOST: process.env.SMTP_HOST,
        PORT: Number(process.env.SMTP_PORT || 587),
        USER: process.env.SMTP_USER,
        PASS: process.env.SMTP_PASS,
        FROM: process.env.SMTP_FROM || '"MantaKopi DSS" <noreply@mantakopi.com>',
      }
    : null,
};
