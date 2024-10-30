import linearClient from "../../config/client.mjs";

async function fetchLabels({ teamId }) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);
    
    if (!team) {
      console.error(`Team with ID ${teamId} not found.`);
      return;
    }

    // Fetch labels for the team
    const labels = await team.labels();

    const data = labels.nodes.map((label) => {
      return {
        name: label.name,
        id: label.id,
      };
    });

    return data;
    
  } catch (error) {
    console.error('Error fetching labels:', error.message);
  }
}

export default fetchLabels;