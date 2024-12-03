import { promises as fs } from "fs";

import DetailedLogger from "../../logger/detailed_logger.mjs";

import path from "path";

const detailedLogger = new DetailedLogger();

async function getUserMapping(teamName) {
  try {
    const projectRoot = path.join(process.cwd());
    const mappingPath = path.join(
      projectRoot,
      "log",
      teamName,
      "user_mapping.json",
    );

    detailedLogger.loading("Looking for user mapping file");

    const mappingFile = await fs.readFile(mappingPath, "utf8");
    const userMappingPath = JSON.parse(mappingFile);

    detailedLogger.info(`User mapping file found at ${mappingPath}`);

    return userMappingPath.mapping;
  } catch (error) {
    detailedLogger.warning(
      `Could not load user mapping file: ${error.message}`,
    );
    process.exit(0);
  }
}

export default getUserMapping;
