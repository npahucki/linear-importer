import fs from "fs/promises";
import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

const logSuccessfulImport = async ({ team, issue, newIssue, importNumber }) => {
  try {
    // Use getTeamLogPath as a static method instead
    const filePath = Logger.getTeamLogPath(team.name, "successful_imports.csv");

    // Check if file exists, if not create it with headers
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, "Date,Pivotal ID,Linear ID,Title\n");
    }

    const logEntry = `${new Date().toISOString()},${issue.id},${newIssue.id},${issue.title}\n`;
    await fs.appendFile(filePath, logEntry);

    detailedLogger.created({
      attribute: `${importNumber} - Issue`,
      originalId: issue.id,
      createdId: newIssue._issue.id,
      message: issue.title,
    });

    if (issue.release) {
      const filePath = Logger.getTeamLogPath(team.name, "release_issues.csv");

      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, "Iteration,Linear ID,Pivotal ID,Title\n");
      }

      console.log("newIssue! ", newIssue);

      const logEntry = `${issue.iteration},${newIssue._issue.id},${issue.id},${issue.title}\n`;
      await fs.appendFile(filePath, logEntry);
    }
  } catch (error) {
    detailedLogger.importantError(
      `Failed to log successful import for story ${issue.id}:`,
      error,
    );
    process.exit(1);
  }
};

export default logSuccessfulImport;
