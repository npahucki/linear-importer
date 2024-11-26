import fs from "fs/promises";
import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

const logSuccessfulImport = async ({ team, issue, importNumber }) => {
  try {
    // Use getTeamLogPath as a static method instead
    const filePath = Logger.getTeamLogPath(team.name, "successful_imports.csv");

    // Check if file exists, if not create it with headers
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, "Date,ID,Title\n");
    }

    const logEntry = `${new Date().toISOString()},${issue.id},${issue.title}\n`;
    await fs.appendFile(filePath, logEntry);

    detailedLogger.result(`${importNumber} - Issue created: ${issue.title}`);

    // const issueId = newIssue._issue.id;
    // console.log(
    //   chalk.green(
    //     `✅ ${importNumber} - Linear Issue ${issueId} created from Pivotal story ${
    //       pivotalStory.id
    //     } - ${chalk.magenta(pivotalStory.name)}`,
    //   ),
    // );
  } catch (error) {
    detailedLogger.importantError(
      `Failed to log successful import for story ${issue.id}:`,
      error,
    );
    process.exit(1);
  }
};

export default logSuccessfulImport;
