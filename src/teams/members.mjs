import linearClient from "../../config/client.mjs";

async function getTeamMembers(teamId) {
  try {
    const team = await linearClient.team(teamId);
    const members = await team.members();
    return members;
  } catch (error) {
    console.error("Error fetching team members:", error.message);
    return [];
  }
}

export default getTeamMembers;