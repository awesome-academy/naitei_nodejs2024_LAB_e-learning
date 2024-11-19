import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_TEST_DATABASE,
} = process.env;

const database =
  process.env.NODE_ENV === "test" ? DB_TEST_DATABASE : DB_DATABASE;

export const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: parseInt(DB_PORT ?? "3306"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: database,
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.ts"],
  migrations: ["src/migration/*.ts"],
});
