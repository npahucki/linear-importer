import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";

async function importFiles() {
  const { shouldImportFiles } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportFiles",
      message: "Do you want to import file attachments?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`shouldImportFiles: ${shouldImportFiles}`);

  return shouldImportFiles;
}

export default importFiles;
