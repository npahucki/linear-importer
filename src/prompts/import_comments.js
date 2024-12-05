import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";

async function importComments() {
  const { shouldImportComments } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportComments",
      message: "Do you want to import comments?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`shouldImportComments: ${shouldImportComments}`);

  return shouldImportComments;
}

export default importComments;
