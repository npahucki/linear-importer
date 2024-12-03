import linearClient from "../../config/client.mjs";

async function fetchCyclesForTeam(teamId) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);
    
    if (!team) {
      console.error(`Team with ID ${teamId} not found.`);
      return;
    }

    // Fetch cycles for the team
    const cycles = await team.cycles();

    const data = cycles.nodes.map((cycle) => {
      return {
        name: cycle.name,
        id: cycle.id,
        startDate: cycle.startsAt,
        endDate: cycle.endsAt,
        // Add any other relevant cycle properties
      };
    });

    console.log("cycles", data)

    return data;
    
  } catch (error) {
    console.error('Error fetching cycles:', error.message);
  }
}

export default fetchCyclesForTeam;