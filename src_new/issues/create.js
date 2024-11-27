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
import { roundEstimate } from "../estimates/rounder.mjs";
import { REQUEST_DELAY_MS } from "../../config/config.js";
import buildParams from "./build_params.js";

const detailedLogger = new DetailedLogger();

/**
 * Creates issues in Linear based on the provided properties
 * @param {Object} props - The properties object
 * @param {Object} props.team - The Linear team object
 * @param {Object} props.payload - The payload containing issues to create
 * @param {Array<Object>} props.payload.issues - Array of issues to create
 * @param {Object} props.options - Import options
 * @param {boolean} props.options.shouldImportLabels - Whether to import labels
 * @param {boolean} props.options.shouldImportEstimates - Whether to import estimates
 * @param {boolean} props.options.shouldFormatPriority - Whether to format priority
 * @param {string} props.directory - Directory path for attachments
 * @returns {Promise<void>}
 */
async function create({
  team,
  issuesPayload,
  options,
  importSource,
  directory,
}) {
  // Keep outside of loop to only fetch these values once
  const teamStatuses = await fetchStatuses(team.id);
  const teamLabels = await fetchLabels({ teamId: team.id });
  const { scale } = await fetchIssueEstimationSettings({
    teamId: team.id,
  });

  detailedLogger.importantInfo(`Params: ${JSON.stringify(params, null, 2)}`);

  for (const [index, issue] of issuesPayload.entries()) {
    try {
      const issueParams = buildParams({
        team,
        issue,
        options,
        importSource,
        teamStatuses,
        teamLabels,
        scale,
        index,
      });

      // process.exit(0);

      const newIssue = await linearClient.createIssue(issueParams);
      await logSuccessfulImport({
        team,
        issue,
        importNumber: index + 1,
      });

      // await createComments();
      // await createAttachments();

      // Wait 1 second between processing each issue
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    } catch (error) {
      detailedLogger.error(`Failed to create issue: ${error.message}`);
      throw error;
    }
  }
}

export default create;
