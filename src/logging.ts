import pino, { LoggerOptions } from "pino";
import pinoHttp from "pino-http";
import config from "./config";

const pinoConfig: Record<string, LoggerOptions> = {
  development: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    level: "info",
  },
  test: {
    level: "info",
  },
};

function envToLogger(environment: string) {
  if (environment === "development") {
    return pinoConfig.development;
  } else if (environment === "test") {
    return pinoConfig.test;
  } else if (environment === "production") {
    return pinoConfig.production;
  } else {
    console.error("Unknown environment for logger, reverting to 'development'");
    return pinoConfig.development;
  }
}

const logger = pino(envToLogger(config.NODE_ENV));
export const httpLogger = pinoHttp(logger);

export default logger;
