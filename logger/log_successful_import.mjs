import fs from "fs/promises";
import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

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

    detailedLogger.success(
      `Logging successful import for story ${pivotalStoryId}`,
    );

    // const issueId = newIssue._issue.id;
    // console.log(
    //   chalk.green(
    //     `✅ ${importNumber} - Linear Issue ${issueId} created from Pivotal story ${
    //       pivotalStory.id
    //     } - ${chalk.magenta(pivotalStory.name)}`,
    //   ),
    // );
  } catch (error) {
    console.error(
      `Failed to log successful import for story ${pivotalStoryId}:`,
      error,
    );
  }
};

export default logSuccessfulImport;
