import { LinearClient } from "@linear/sdk";
import { API_KEY } from "./config.js";
import chalk from "chalk";

// Initialize Linear Client
const linearClient = new LinearClient({
  apiKey: API_KEY,
});

console.log(
  chalk.blue(`
  ╔═══════════════════════════════╗
  ║                               ║
  ║   ${chalk.green("LinearClient Initialized!")}   ║
  ║                               ║
  ╚═══════════════════════════════╝
  `),
);

export default linearClient;
