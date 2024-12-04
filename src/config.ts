import { readFile } from 'fs/promises';
import { resolve } from 'path';

export interface ServerConfig {
  name: string;
  transport: {
    command: string;
    args?: string[];
  };
}

export interface Config {
  servers: ServerConfig[];
}

export const loadConfig = async (configPath: string): Promise<Config> => {
  try {
    const absolutePath = resolve(process.cwd(), configPath);
    const fileContents = await readFile(absolutePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading config from ${configPath}:`, error);
    throw new Error('Failed to load config file. Please provide a valid config.json file.');
  }
}; 