import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function createComment({ issueId, body }) {
  try {
    const response = await linearClient.createComment({
      issueId,
      body,
    });

    if (response.success) {
      detailedLogger.createdSecondary(`Comment`, response._comment.id, body);

      return response._comment;
    } else {
      detailedLogger.error(`Error creating comment: ${response.errors}`);
      process.exit(1);
    }
  } catch (error) {
    detailedLogger.error("Error creating comment:", error.message);
    process.exit(1);
  }
}

export default createComment;
