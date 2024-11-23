import inquirer from "inquirer";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function importEstimates() {
  const { shouldImportEstimates } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportEstimates",
      message: "Do you want to import estimates?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`shouldImportEstimates: ${shouldImportEstimates}`);

  return shouldImportEstimates;
}

export default importEstimates;
