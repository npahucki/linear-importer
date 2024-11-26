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
import { MAX_REQUESTS_PER_SECOND } from "../../config/config.js";
import { roundEstimate } from "../estimates/rounder.mjs";

const detailedLogger = new DetailedLogger();

async function createIssues({ team, payload, options, directory }) {
  const teamStatuses = await fetchStatuses({ teamId: team.id });
  const teamLabels = await fetchLabels({ teamId: team.id });
  const { scale } = await fetchIssueEstimationSettings({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  const DELAY = 1000;

  // TODO:
  // - create a comment for each pull request link

  for (const [index, issue] of payload.issues.entries()) {
    const stateId = teamStatuses.find(
      (state) => state.name === `pivotal - ${issue.state}`,
    )?.id;

    const pivotalStoryTypeLabelId = teamLabels.find(
      (label) => label.name === `pivotal - ${issue.type}`,
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
        cycleId: null,
      };

      detailedLogger.importantInfo(
        `Params: ${JSON.stringify(params, null, 2)}`,
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
            try {
              const newComment = await createComment({
                issueId: newIssue._issue.id,
                body,
              });
              detailedLogger.result(`Comment created: ${newComment.id}`);
              // Add delay between comment creations
              await new Promise((resolve) => setTimeout(resolve, DELAY));
            } catch (error) {
              detailedLogger.error(`Error creating comment: ${error.message}`);
              process.exit(1);
            }
          }
          detailedLogger.success(
            `(${issue.comments.length}) comment(s) created.`,
          );
        }
      }

      if (options.shouldImportFiles) {
        const attachments = await findAttachmentsInFolder({
          csvFilename: directory,
          pivotalStoryId: issue.id,
        });

        if (attachments.length > 0) {
          for (const attachment of attachments) {
            try {
              await upload(attachment, newIssue._issue.id);
              detailedLogger.success(`Attachment uploaded: ${attachment}`);
              // Add delay between file uploads
              await new Promise((resolve) => setTimeout(resolve, DELAY));
            } catch (error) {
              detailedLogger.error(
                `Error uploading attachment ${attachment}: ${error.message}`,
              );
              process.exit(1);
            }
          }
        } else {
          detailedLogger.info(`No attachments found for story ${issue.id}`);
        }
      }

      // Wait 1 second between processing each issue
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    } catch (error) {
      detailedLogger.error(`Failed to create issue: ${error.message}`);
      throw error;
    }
  }
}

export default createIssues;
