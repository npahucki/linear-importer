import linearClient from "../../config/client.mjs";

async function getTeamMembers({ teamId }) {
  try {
    const team = await linearClient.team(teamId);  // Pass teamId directly, not as an object
    const members = await team.members();
    return { teamMembers: members };
  } catch (error) {
    console.error("Error fetching team members:", error.message);
    return { teamMembers: [] };
  }
}

export default getTeamMembers;