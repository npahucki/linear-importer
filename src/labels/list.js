import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function fetchLabels(teamId) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);

    if (!team) {
      detailedLogger.importantError(`Team with ID ${teamId} not found.`);
      process.exit(0);
    }

    // Fetch all labels using pagination
    let allLabels = [];
    let hasNextPage = true;
    let after = undefined;

    while (hasNextPage) {
      const response = await team.labels({ first: 100, after });
      allLabels.push(...response.nodes);
      hasNextPage = response.pageInfo.hasNextPage;
      after = response.pageInfo.endCursor;
    }

    const data = allLabels.map((label) => ({
      name: label.name,
      id: label.id,
    }));

    detailedLogger.info(`Team Labels: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error("Error fetching labels:", error.message);
  }
}

export default fetchLabels;
