import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import getUserMapping from "../users/get_user_mapping.mjs";
import fetchLabels from "../labels/list.mjs";
import fetchEstimatesForTeam from "../estimates/list.mjs";

const detailedLogger = new DetailedLogger();

async function createIssues({ team, payload }) {
  const labels = await fetchLabels({ teamId: team.id });
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  detailedLogger.result(`userMapping: ${JSON.stringify(userMapping, null, 2)}`);
  detailedLogger.result(`labels: ${JSON.stringify(labels, null, 2)}`);
  detailedLogger.result(
    `issueEstimation: ${JSON.stringify(issueEstimation, null, 2)}`,
  );

  try {
    // const newIssue = await linearClient.createIssue({
    //   teamId: team.id,
    //   title: "NEW TITLE TEST",
    // });

    detailedLogger.success("Issue created!");
    return;
    // return newIssue;
  } catch (error) {
    detailedLogger.error(`Failed to create issue: ${error.message}`);
    throw error;
  }
}

export default createIssues;
