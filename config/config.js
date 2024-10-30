import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "..", ".env") });

export const API_KEY = process.env.API_KEY;
export const REQUESTS_PER_SECOND = process.env.REQUESTS_PER_SECOND;
export const ENABLE_DETAILED_LOGGING = process.env.ENABLE_DETAILED_LOGGING == 'true';
export const ENABLE_IMPORTING = process.env.ENABLE_IMPORTING == 'true';

export const exitProcess = (code = 1) => {
  console.error("EXITING PROCESS");
  process.exit(code);
};