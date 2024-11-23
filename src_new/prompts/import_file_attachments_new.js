import inquirer from "inquirer";
import DetailedLogger from "../../logger/detailed_logger.mjs";

async function importFileAttachments() {
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

  const detailedLogger = new DetailedLogger();
  detailedLogger.info(
    `Do you want to import file attachments? : ${shouldImportFiles}`,
  );

  return shouldImportFiles;
}

export default importFileAttachments;
