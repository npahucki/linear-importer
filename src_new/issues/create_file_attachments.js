import findAttachmentsInFolder from "../files/find_attachments_in_folder.js";
import upload from "../files/upload.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import { REQUEST_DELAY_MS } from "../../config/config.js";

const detailedLogger = new DetailedLogger();

async function createFileAttachments({ issue, newIssue, directory }) {
  try {
    detailedLogger.loading(`Finding file attachments for story ${issue.id}`);

    const attachments = await findAttachmentsInFolder({
      csvFilename: directory,
      originalIssueId: issue.id,
    });

    detailedLogger.result(
      `Found ${attachments.length} attachments for story ${issue.id}`,
    );

    for (const attachment of attachments) {
      try {
        await upload(attachment, newIssue._issue.id);
        detailedLogger.createdSecondary("Attachment", attachment, "success!");

        // Add delay between uploads
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
      } catch (uploadError) {
        detailedLogger.error(
          `Failed to upload attachment ${attachment}: ${uploadError.message}`,
        );
        process.exit(0);
      }
    }
  } catch (error) {
    detailedLogger.error(
      `Error processing attachments for story ${issue.id}: ${error.message}`,
    );
    process.exit(0);
  }
}

export default createFileAttachments;
