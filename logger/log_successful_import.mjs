import fs from "fs/promises";
import Logger from "./logger.mjs";

const logSuccessfulImport = async (pivotalStoryId, teamName) => {
  try {
    // Use getTeamLogPath as a static method instead
    const filePath = Logger.getTeamLogPath(teamName, "successful_imports.csv");

    // Check if file exists, if not create it with headers
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, "Date,ID\n");
    }

    const logEntry = `${new Date().toISOString()},${pivotalStoryId}\n`;
    await fs.appendFile(filePath, logEntry);
  } catch (error) {
    console.error(
      `Failed to log successful import for story ${pivotalStoryId}:`,
      error,
    );
  }
};

export default logSuccessfulImport;
