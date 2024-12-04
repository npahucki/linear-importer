import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";

async function importLabels() {
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

  detailedLogger.info(`shouldImportLabels: ${shouldImportLabels}`);

  return shouldImportLabels;
}

export default importLabels;
