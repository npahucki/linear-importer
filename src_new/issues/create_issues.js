import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import logSuccessfulImport from "../../logger/log_successful_import.mjs";
import getUserMapping from "../users/get_user_mapping.mjs";
import fetchLabels from "../labels/list.mjs";
import fetchStatuses from "../statuses/list.mjs";
import fetchEstimatesForTeam from "../estimates/list.mjs";

import { findClosestEstimate } from "../estimates/rounder.mjs";

const detailedLogger = new DetailedLogger();

async function createIssues({ team, payload, options }) {
  detailedLogger.importantLoading("Creating issues");

  const teamStatuses = await fetchStatuses({ teamId: team.id });
  const teamLabels = await fetchLabels({ teamId: team.id });
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  // TODO:
  // - create a comment for each pull request link

  payload.issues.map(async (issue) => {
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
      ? findClosestEstimate(issue.estimate, issueEstimation.type)
      : undefined;

    try {
      const params = {
        teamId: team.id,
        title: issue.name,
        description: issue.description,
        stateId,
        labelIds,
        estimate,
      };

      detailedLogger.importantInfo(
        `Params: ${JSON.stringify(params, null, 2)}`,
      );

      await linearClient.createIssue(params);
      await logSuccessfulImport(issue.id, team.name);
    } catch (error) {
      detailedLogger.error(`Failed to create issue: ${error.message}`);
      throw error;
    }
  });
}

export default createIssues;

// const newIssue = await linearClient.createIssue({
//   teamId,
//   labelIds,
//   title: pivotalStory.name,
//   description: pivotalStory.description,
//   stateId: stateId ? stateId : undefined,
//   parentId: parentId ? parentId : undefined,
//   dueDate: pivotalStory.dueDate
//     ? new Date(pivotalStory.dueDate).toISOString()
//     : undefined,
//   createdAt: pivotalStory.createdAt
//     ? new Date(pivotalStory.createdAt).toISOString()
//     : undefined,
//   priority: formatPriority(pivotalStory.priority),
//   assigneeId,
//   subscriberIds,
//   cycleId: null,
//   estimate: pivotalStory.estimate ? findClosestEstimate(pivotalStory.estimate, estimationScale) : undefined,
// });

// detailedLogger.importantSuccess(
//   `Payload: ${JSON.stringify(payload, null, 2)}`,
// );
// detailedLogger.info(
//   `Issue Estimation: ${JSON.stringify(issueEstimation, null, 2)}`,
// );
// detailedLogger.result(`labels: ${JSON.stringify(labels, null, 2)}`);
// detailedLogger.result(
//   `issueEstimation: ${JSON.stringify(issueEstimation, null, 2)}`,
// );
