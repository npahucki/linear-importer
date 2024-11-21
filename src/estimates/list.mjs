import linearClient from "../../config/client.mjs";

const ESTIMATION_SCALES = {
  not_in_use: null,
  exponential: [0, 1, 2, 4, 8, 16, 32, 64],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21],
  linear: [0, 1, 2, 3, 4, 5, 6, 7],
};

async function fetchEstimatesForTeam({ teamId }) {
  if (!teamId) {
    throw new Error("teamId is required");
  }

  try {
    const team = await linearClient.team(teamId);
    const issueEstimationType = await team.issueEstimationType;

    const estimationScale = ESTIMATION_SCALES[issueEstimationType] || null;

    const data = {
      type: issueEstimationType,
      scale: estimationScale,
    };

    console.log("DATA!!! ", data);
    return data;
  } catch (error) {
    console.error("Error fetching estimates:", error);
    throw error;
  }
}

export default fetchEstimatesForTeam;
