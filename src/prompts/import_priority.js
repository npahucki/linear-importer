import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";

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
