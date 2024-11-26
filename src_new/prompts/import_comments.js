import inquirer from "inquirer";
import DetailedLogger from "../../logger/detailed_logger.mjs";

async function importComments() {
  const detailedLogger = new DetailedLogger();
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
