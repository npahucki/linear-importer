import inquirer from "inquirer";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function importPriority() {
  const { shouldImportPriority } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportPriority",
      message: "Do you want to import priority?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`shouldImportPriority: ${shouldImportPriority}`);

  return shouldImportPriority;
}

export default importPriority;
