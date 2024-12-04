import inquirer from "inquirer";
import { detailedLogger } from "../../logger/logger_instance.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// List directories in the assets directory
async function listAssetDirectories() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsDir = path.join(__dirname, "..", "..", "assets");

  const items = await fs.readdir(assetsDir, { withFileTypes: true });

  return items.filter((item) => item.isDirectory()).map((item) => item.name);
}

async function selectDirectory() {
  const directories = await listAssetDirectories();

  if (directories.length === 0) {
    detailedLogger.warning("No directories found in the assets directory.");
    return;
  }

  const { selectedDirectory } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedDirectory",
      message: "Select a directory:",
      choices: directories,
    },
  ]);

  detailedLogger.info(`Selected directory: ${selectedDirectory}`);

  return selectedDirectory;
}

export default selectDirectory;
