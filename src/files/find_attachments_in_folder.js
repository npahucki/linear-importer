import fs from "fs/promises";
import path from "path";
import { detailedLogger } from "../../logger/logger_instance.js";

async function findAttachmentsInFolder({ csvFilename, originalIssueId }) {
  try {
    // Remove the .csv extension from the filename
    const folderName = csvFilename.replace(".csv", "-export");

    // Construct the path to the story's attachment folder
    const attachmentFolderPath = path.join(
      process.cwd(),
      "assets",
      folderName,
      originalIssueId.toString(),
    );

    detailedLogger.loading(
      `Looking for attachments in: ${attachmentFolderPath}`,
    );

    // Check if the folder exists
    await fs.access(attachmentFolderPath);

    // Read the contents of the folder
    const files = await fs.readdir(attachmentFolderPath);

    if (files.length === 0) {
      detailedLogger.info(`No attachments found for story ${originalIssueId}`);
      return;
    }

    detailedLogger.info(`Found ${files.length} attachments`);

    // Filter out any non-file entries and construct full file paths
    const attachments = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(attachmentFolderPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          return filePath;
        }

        return null;
      }),
    );

    // Remove any null entries and return the list of attachment file paths
    return attachments.filter(Boolean);
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the folder doesn't exist, return an empty array
      return [];
    }
    // For other errors, log and re-throw
    console.error("Error finding attachments:", error);
    throw error;
  }
}

export default findAttachmentsInFolder;
