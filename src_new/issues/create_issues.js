import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import getUserMapping from "../users/get_user_mapping.mjs";
import fetchLabels from "../labels/list.mjs";
import fetchEstimatesForTeam from "../estimates/list.mjs";

import { findClosestEstimate } from "../estimates/rounder.mjs";

const detailedLogger = new DetailedLogger();

async function createIssues({ team, payload, options }) {
  const teamLabels = await fetchLabels({ teamId: team.id });
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  // detailedLogger.importantSuccess(
  //   `Payload: ${JSON.stringify(payload, null, 2)}`,
  // );
  // detailedLogger.info(`Options: ${JSON.stringify(options, null, 2)}`);
  // detailedLogger.info(
  //   `Issue Estimation: ${JSON.stringify(issueEstimation, null, 2)}`,
  // );
  // detailedLogger.result(`userMapping: ${JSON.stringify(userMapping, null, 2)}`);
  // detailedLogger.result(`labels: ${JSON.stringify(labels, null, 2)}`);
  // detailedLogger.result(
  //   `issueEstimation: ${JSON.stringify(issueEstimation, null, 2)}`,
  // );

  payload.issues.map(async (formattedIssueParams) => {
    try {
      const params = {
        teamId: team.id,
        title: formattedIssueParams.name,
        description: formattedIssueParams.description,
        labelIds: options.shouldImportLabels
          ? teamLabels.filter((label) =>
              formattedIssueParams.labels.includes(label.name),
            )
          : undefined,
        estimate: options.shouldImportEstimates
          ? findClosestEstimate(
              formattedIssueParams.estimate,
              issueEstimation.scale,
            )
          : undefined,
      };

      await linearClient.createIssue(params);
    } catch (error) {
      detailedLogger.error(`Failed to create issue: ${error.message}`);
      throw error;
    }
  });
}

export default createIssues;
