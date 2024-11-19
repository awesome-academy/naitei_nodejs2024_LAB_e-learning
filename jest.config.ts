import type { Config } from "@jest/types";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/src"],
};

export default config;
