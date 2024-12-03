import linearClient from "../../config/client.mjs";

async function fetchStatuses(teamId) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);

    if (!team) {
      console.error(`Team with ID ${teamId} not found.`);
      return;
    }

    // Fetch statuses for the team
    const statuses = await team.states();

    const data = statuses.nodes.map((status) => {
      return {
        name: status.name,
        id: status.id,
        type: status.type,
      };
    });

    return data;
  } catch (error) {
    console.error(
      chalk.red(`Error fetching statuses for team ${teamId}:`, error.message),
    );
  }
}

export default fetchStatuses;
