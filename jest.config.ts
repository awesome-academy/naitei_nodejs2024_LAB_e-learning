import type { Config } from '@jest/types';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';

const envPath = './env/text.env'; 

if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath });
} else {
  console.warn(`Environment file ${envPath} not found. Jest will proceed without it.`);
}

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src'],
};

export default config;
