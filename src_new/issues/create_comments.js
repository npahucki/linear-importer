import createComment from "../comments/create.mjs";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function createComments({ issue, newIssue }) {
  detailedLogger.loading(`Finding comments for story ${issue.id}`);

  if (issue.comments.length === 0) {
    detailedLogger.info(`No comments found for story ${issue.id}.`);
    return;
  }

  // Create comments
  for (const body of issue.comments) {
    await createComment({
      issueId: newIssue._issue.id,
      body,
    });

    detailedLogger.createdSecondary(
      `Created comment`,
      `Issue ID: ${newIssue._issue.id}`,
      body,
    );

    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }
}

export default createComments;
