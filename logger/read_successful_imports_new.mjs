import fs from "fs/promises";
import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

const readSuccessfulImports = async ({ team }) => {
  if (!team.name) {
    detailedLogger.warning("No team name provided to readSuccessfulImports");
    process.exit(0);
  }

  try {
    const filePath = Logger.getTeamLogPath(team.name, "successful_imports.csv");

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      detailedLogger.info(
        `No existing import log found for team "${team.name}"`,
      );
      return new Set();
    }

    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n").slice(1); // Skip header row

    const successfulImports = new Set(
      lines
        .filter((line) => line.trim()) // Remove empty lines
        .map((line) => {
          const [, id] = line.split(",");
          return id?.trim(); // Ensure ID is trimmed
        })
        .filter(Boolean), // Remove any undefined/null/empty values
    );
    detailedLogger.info(
      `Found ${successfulImports.size} previously imported stories for team "${team.name}"`,
    );

    return successfulImports;
  } catch (error) {
    detailedLogger.error(
      `Error reading successful imports for team "${team.name}":`,
      error,
    );
    process.exit(0);
  }
};

export default readSuccessfulImports;
