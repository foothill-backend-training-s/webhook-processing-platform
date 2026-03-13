import type { MigrationConfig } from "drizzle-orm/migrator";
process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// type APIConfig = {};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

// const API: APIConfig = {}
const DB: DBConfig = {
  url: envOrThrow("DB_URL"),
  migrationConfig: migrationConfig,
};

export const config = {
  //   api: API,
  db: DB,
};
