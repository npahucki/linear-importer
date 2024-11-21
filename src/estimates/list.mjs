import linearClient from "../../config/client.mjs";

/**
 * Fetches estimate scales for a specific team
 * @param {Object} params - The parameters object
 * @param {string} params.teamId - The Linear team ID
 * @returns {Promise<Array<{name: string, id: string, value: number, label: string}>>}
 */
async function fetchEstimatesForTeam({ teamId }) {
  if (!teamId) {
    throw new Error('teamId is required');
  }

  try {
    const team = await linearClient.team(teamId);
    const issueEstimationType = await team.issueEstimationType;

    console.log("issueEstimationType!!!!!!!!", issueEstimationType);

    const estimateValues = await issueEstimationType.estimateValues;

    console.log("estimateValues!!!!!!!!", estimateValues);

    
  } catch (error) {
    console.error('Error fetching estimates:', error);
    throw error;
  }
}

export default fetchEstimatesForTeam;