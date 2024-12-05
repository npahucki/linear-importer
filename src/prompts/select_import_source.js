import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";

async function selectImportSource() {
  const { importSource } = await inquirer.prompt([
    {
      type: "list",
      name: "importSource",
      message: "Select an import source:",
      choices: [{ name: "Pivotal", value: "pivotal" }],
    },
  ]);

  detailedLogger.info(`Import Source: ${importSource}`);

  return importSource;
}

export default selectImportSource;
