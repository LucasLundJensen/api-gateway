import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "../", ".env"),
});

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "0.0.0.0",
  PORT: process.env.PORT || "1000",
  CONFIG_FOLDER_PATH: process.env.CONFIG_FOLDER_PATH || "./config/",
};

export default config;
