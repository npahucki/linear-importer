import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function fetchLabels(teamId) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);

    if (!team) {
      console.error(`Team with ID ${teamId} not found.`);
      return;
    }

    // Fetch labels for the team
    const labels = await team.labels();

    // detailedLogger.result(`Labels: ${JSON.stringify(labels, null, 2)}`);

    const data = labels.nodes.map((label) => {
      return {
        name: label.name,
        id: label.id,
      };
    });

    detailedLogger.info(`Team Labels: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error("Error fetching labels:", error.message);
  }
}

export default fetchLabels;
