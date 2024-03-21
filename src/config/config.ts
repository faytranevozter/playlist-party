import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export const botToken: string = process.env.TELEGRAM_BOT_TOKEN || "";

export const port: number = parseInt(process.env.PORT || "3000");

export const appDomain: string = process.env.APP_DOMAIN || "localhost";
