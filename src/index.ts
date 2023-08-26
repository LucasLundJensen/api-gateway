import express from "express";
import logger, { httpLogger } from "./logging";
import { setupProxy } from "./proxy";
const app = express();

app.use(httpLogger);

setupProxy(app);

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});
