import linearClient from "../../config/client.mjs";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function getTeamMembers({ teamId }) {
  try {
    const team = await linearClient.team(teamId); // Pass teamId directly, not as an object
    const members = await team.members();

    detailedLogger.info(`Team Members: ${JSON.stringify(members, null, 2)}`);
    return { teamMembers: members };
  } catch (error) {
    detailedLogger.error(`Error fetching team members: ${error.message}`);
    return { teamMembers: [] };
  }
}

export default getTeamMembers;
