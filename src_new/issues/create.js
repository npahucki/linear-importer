import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import logSuccessfulImport from "../../logger/log_successful_import.mjs";
import getUserMapping from "../users/get_user_mapping.mjs";
import fetchLabels from "../labels/list.mjs";
import fetchStatuses from "../statuses/list.mjs";
import fetchIssueEstimationSettings from "../estimates/list.mjs";
import findAttachmentsInFolder from "../files/find_attachments_in_folder.mjs";
import upload from "../files/upload.mjs";
import createComment from "../comments/create.mjs";
import formatPriority from "../priority/formatter.js";
import roundEstimate from "../estimates/rounder.mjs";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import buildIssueParams from "./build_issue_params.js";
import createComments from "./create_comments.js";
import createFileAttachments from "./create_file_attachments.js";

const detailedLogger = new DetailedLogger();

async function create({
  team,
  issuesPayload,
  options,
  importSource,
  directory,
}) {
  // Keep outside of loop to only fetch these values once
  const teamStatuses = await fetchStatuses(team.id);
  const teamLabels = await fetchLabels(team.id);
  const { scale } = await fetchIssueEstimationSettings(team.id);

  for (const [index, issue] of issuesPayload.entries()) {
    try {
      const issueParams = await buildIssueParams({
        team,
        issue,
        options,
        importSource,
        teamStatuses,
        teamLabels,
        scale,
        index,
      });

      // Create Issue
      const newIssue = await linearClient.createIssue(issueParams);

      // Write successful import to log
      await logSuccessfulImport({
        team,
        issue,
        newIssue,
        importNumber: index + 1,
      });

      // Create Comments
      if (options.shouldImportComments)
        await createComments({ issue, newIssue });

      // Create File Attachments
      if (options.shouldImportFiles)
        await createFileAttachments({ issue, newIssue, directory });

      // Wait 1 second between processing each issue
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    } catch (error) {
      detailedLogger.importantError(`Failed to create issue: ${error.message}`);
      process.exit(0);
    }
  }
}

export default create;
