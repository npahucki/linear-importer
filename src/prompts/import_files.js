import inquirer from "inquirer";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

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
