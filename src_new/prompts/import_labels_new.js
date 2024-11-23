import inquirer from "inquirer";
import DetailedLogger from "../../logger/detailed_logger.mjs";

async function importLabels() {
  const detailedLogger = new DetailedLogger();
  const { shouldImportLabels } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportLabels",
      message: "Do you want to import labels?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`Should import labels: ${shouldImportLabels}`);

  return shouldImportLabels;
}

export default importLabels;
