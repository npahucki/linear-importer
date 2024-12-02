import findAttachmentsInFolder from "../files/find_attachments_in_folder.js";
import upload from "../files/upload.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function createFileAttachments({ issue, newIssue, directory }) {
  detailedLogger.loading(`Finding file attachments for story ${issue.id}`);

  const attachments = await findAttachmentsInFolder({
    csvFilename: directory,
    pivotalStoryId: issue.id,
  });

  if (attachments.length === 0) {
    detailedLogger.info(`No attachments found for story ${issue.id}`);
    return;
  }

  detailedLogger.info(
    `Found ${attachments.length} attachments for story ${issue.id}`,
  );

  for (const attachment of attachments) {
    await upload(attachment, newIssue._issue.id);

    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }
}

export default createFileAttachments;
