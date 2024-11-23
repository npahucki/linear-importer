import chalk from "chalk";

import { promises as fs } from "fs";

import { ENABLE_DETAILED_LOGGING } from "../../config/config.js";

import path from "path";

async function getUserMapping(teamName) {
  try {
    const projectRoot = path.join(process.cwd(), "..");
    const mappingPath = path.join(
      projectRoot,
      "log",
      teamName,
      "user_mapping.json",
    );

    if (ENABLE_DETAILED_LOGGING) {
      console.log("Looking for mapping file at:", mappingPath);
    }

    const mappingFile = await fs.readFile(mappingPath, "utf8");
    const mappingData = JSON.parse(mappingFile);
    return mappingData.mapping;
  } catch (error) {
    console.warn(
      chalk.yellow(
        `Warning: Could not load user mapping file: ${error.message}`,
      ),
    );
    return {};
  }
}

export default getUserMapping;
