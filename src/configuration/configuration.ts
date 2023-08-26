import config from "../config";
import path from "path";
import fs from "fs";
import { promisify } from "util";
const readFileAsync = promisify(fs.readFile);

export interface Gateway {
  url: string;
  requestSizeLimit: string;
  timeout: number;
  https: boolean;
  authentication?: {
    enabled: boolean;
    service?: string;
  };
}

export interface GatewayConfig {
  [key: string]: Gateway;
}

export async function getGatewayConfig(): Promise<GatewayConfig> {
  const configFile = await readFileAsync(
    path.join(config.CONFIG_FOLDER_PATH, "gateway-config.json"),
    "utf-8"
  );

  const configs: GatewayConfig = JSON.parse(configFile);
  return configs;
}

export async function getGatewayConfigByName(name: string): Promise<Gateway> {
  const configs = await getGatewayConfig();
  return configs[name];
}
