import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "3306"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.ts"],
  migrations: ["src/migration/*.ts"],
});
