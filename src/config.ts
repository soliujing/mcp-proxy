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

// This is just an example - you would typically load this from a file
export const loadConfig = async (configPath?: string): Promise<Config> => {
  if (configPath) {
    try {
      const absolutePath = resolve(process.cwd(), configPath);
      const fileContents = await readFile(absolutePath, 'utf-8');
      return JSON.parse(fileContents);
    } catch (error) {
      console.error(`Error loading config from ${configPath}:`, error);
      // Fall back to default config
    }
  }

  // Default config for development
  return {
    servers: [
      {
        name: 'Google Drive',
        transport: {
          command: "/Users/adamwattis/Programming/google-drive-server/build/index.js"
        }
      },
      {
        name: 'sqlite',
        transport: {
          command: "uvx",
          args: ["mcp-server-sqlite", "--db-path", "test.db"]
        }
      }
    ]
  };
}; 