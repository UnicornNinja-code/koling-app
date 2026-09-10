import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

// Startup Fail-Fast Validation for Production Environment
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
    console.error("💥 FATAL CONFIGURATION ERROR: 'JWT_SECRET' is required in production and must be at least 32 characters long!");
    process.exit(1);
  }
  if (!process.env.FRONTEND_URL) {
    console.error("💥 FATAL CONFIGURATION ERROR: 'FRONTEND_URL' is required in production mode!");
    process.exit(1);
  }
}

const env = {
  PORT: Number(process.env.PORT || 5502),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT || 5432),
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "secret",
    NAME: process.env.DB_NAME || "mova_db",
  },
  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: Number(process.env.REDIS_PORT || 6379),
    PASSWORD: process.env.REDIS_PASSWORD || "secret",
  },
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? undefined : "dev_local_jwt_secret_non_prod_only"),
  FRONTEND_URL: process.env.FRONTEND_URL || (isProduction ? undefined : "http://localhost:5173"),
  ADDITIONAL_ALLOWED_ORIGINS: process.env.ADDITIONAL_ALLOWED_ORIGINS
    ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [],
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

export { env };