import inquirer from "inquirer";

import DetailedLogger from "../../logger/detailed_logger.mjs";
import { ENABLE_IMPORTING } from "../../config/config.js";
import chalk from "chalk";

const detailedLogger = new DetailedLogger();

async function proceedWithImport({ confirmationMessage }) {
  detailedLogger.importantInfo(confirmationMessage);

  const { userConfirmedProceed } = await inquirer.prompt([
    {
      type: "list",
      name: "userConfirmedProceed",
      message: "Proceed with import?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      pageSize: 999,
      loop: false,
    },
  ]);

  detailedLogger.info(`userConfirmedProceed: ${userConfirmedProceed}`);
  if (!userConfirmedProceed) {
    detailedLogger.importantError("Import cancelled by user.");
    process.exit(0);
  }

  if (!ENABLE_IMPORTING) {
    console.log(chalk.red.bold("\n╔════════════════════════════════════╗"));
    console.log(chalk.red.bold("║        IMPORTING DISABLED         ║"));
    console.log(chalk.red.bold("║   Enable importing in .env file   ║"));
    console.log(chalk.red.bold("╚════════════════════════════════════╝\n"));
    process.exit(1);
  }

  detailedLogger.importantSuccess(`🚀 Starting import...`);

  return userConfirmedProceed;
}

export default proceedWithImport;
