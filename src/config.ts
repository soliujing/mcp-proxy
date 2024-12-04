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

export const loadConfig = async (): Promise<Config> => {
  try {
    const configPath = resolve(process.cwd(), 'config.json');
    const fileContents = await readFile(configPath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading config.json:', error);
    // Return empty config if file doesn't exist
    return { servers: [] };
  }
}; 