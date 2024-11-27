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

const detailedLogger = new DetailedLogger();

async function createIssues({
  team,
  payload,
  options,
  directory,
  importSource,
}) {
  const teamStatuses = await fetchStatuses(team.id);
  const teamLabels = await fetchLabels({ teamId: team.id });
  const { scale } = await fetchIssueEstimationSettings({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  // TODO:
  // - create a comment for each pull request link

  for (const [index, issue] of payload.issues.entries()) {
    const stateId = teamStatuses.find(
      (state) => state.name === `${importSource} - ${issue.state}`,
    )?.id;

    const pivotalStoryTypeLabelId = teamLabels.find(
      (label) => label.name === `${importSource} - ${issue.type}`,
    )?.id;

    const otherLabelIds = issue.labels
      ? issue.labels
          .split(",")
          .map((label) => label.trim())
          .map(
            (label) =>
              teamLabels.find((teamLabel) => teamLabel.name === label)?.id,
          )
          .filter((id) => id)
      : [];

    const labelIds = [pivotalStoryTypeLabelId, ...otherLabelIds].filter(
      Boolean,
    );

    const estimate = issue.estimate
      ? roundEstimate(issue.estimate, scale)
      : undefined;

    const priority = issue.priority
      ? formatPriority(issue.priority)
      : undefined;

    try {
      const params = {
        teamId: team.id,
        stateId,
        title: issue.title,
        description: issue.description,
        labelIds: options.shouldImportLabels ? labelIds : undefined,
        estimate: options.shouldImportEstimates ? estimate : undefined,
        priority: options.shouldFormatPriority ? priority : undefined,
        // parentId,
        // dueDate,
        // createdAt,
        // assigneeId,
        // subscriberIds,
        cycleId: null,
      };

      detailedLogger.importantInfo(
        `Params!!!: ${JSON.stringify(params, null, 2)}`,
      );

      const newIssue = await linearClient.createIssue(params);
      await logSuccessfulImport({
        team,
        issue,
        importNumber: index + 1,
      });

      // Create comments
      if (options.shouldImportComments) {
        if (issue.comments.length > 0) {
          for (const body of issue.comments) {
            await createComment({ issueId: newIssue._issue.id, body });

            await new Promise((resolve) =>
              setTimeout(resolve, REQUEST_DELAY_MS),
            );
          }
        } else {
          detailedLogger.info(`No comments found for story ${issue.id}.`);
        }
      }

      if (options.shouldImportFiles) {
        const attachments = await findAttachmentsInFolder({
          csvFilename: directory,
          pivotalStoryId: issue.id,
        });

        if (attachments.length > 0) {
          for (const attachment of attachments) {
            await upload(attachment, newIssue._issue.id);

            await new Promise((resolve) =>
              setTimeout(resolve, REQUEST_DELAY_MS),
            );
          }
        } else {
          detailedLogger.info(`No attachments found for story ${issue.id}`);
        }
      }

      // Wait 1 second between processing each issue
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    } catch (error) {
      detailedLogger.importantError(`Failed to create issue: ${error.message}`);
      process.exit(1);
    }
  }
}

export default createIssues;
