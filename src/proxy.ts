import {
  Gateway,
  GatewayConfig,
  getGatewayConfig,
} from "./configuration/configuration";
import { Express, NextFunction, Request, Response } from "express";
import proxy from "express-http-proxy";
import logger from "./logging";
import axios, { AxiosError } from "axios";

export async function setupProxy(app: Express) {
  const gatewayConfig = await getGatewayConfig();

  for (const [key, value] of Object.entries(gatewayConfig)) {
    logger.info(
      `Setting up proxy for api/${key} at ${value.url} ${
        value.authentication?.enabled
          ? `with authentication service ${value.authentication.service}`
          : ""
      }`
    );
    if (value.authentication?.enabled) {
      setupProxyWithIdentity(app, key, value, gatewayConfig);
    } else {
      app.use(
        `/api/${key}`,
        proxy(value.url, {
          limit: value.requestSizeLimit,
          timeout: value.timeout,
          https: value.https,
        })
      );
    }
  }
}

async function setupProxyWithIdentity(
  app: Express,
  serviceName: string,
  serviceConfig: Gateway,
  gatewayConfig: GatewayConfig
) {
  if (!serviceConfig.authentication || !serviceConfig.authentication.service) {
    throw new Error(
      `Authentication service is not defined, but authentication is enabled for ${serviceName}`
    );
  }

  const identityService = gatewayConfig[serviceConfig.authentication.service];
  if (!identityService) {
    throw new Error(
      `Identity service ${serviceConfig.authentication.service} is not defined`
    );
  }

  const identityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.headers.authorization) {
      return res.status(401).send("Missing authorization header");
    }

    try {
      const result = await axios.post(`${identityService.url}/oidc/validate`, {
        id_token: req.body.id_token,
        client_id: req.body.client_id,
      });

      if (result.status !== 200) {
        res.status(401).send();
        return;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return res
          .status(error.response?.status || 500)
          .send(error.response?.data);
      }

      logger.error(
        `Error when validating token with identity service ${identityService.url}`,
        error
      );
      res.status(500).send();
      return;
    }

    next();
  };

  app.use(
    `/api/${serviceName}`,
    identityMiddleware,
    proxy(serviceConfig.url, {
      limit: serviceConfig.requestSizeLimit,
      timeout: serviceConfig.timeout,
      https: serviceConfig.https,
    })
  );
}
