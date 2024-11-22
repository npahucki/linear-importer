import linearClient from "../../config/client.mjs";
import { ESTIMATION_SCALES } from "./estimation_scales.js";

export function findClosestEstimate(value, scale) {
  if (!scale || !value) return null;
  
  const numericValue = Number(value);
  if (isNaN(numericValue)) return null;

  return scale.reduce((closest, current) => {
    return Math.abs(current - numericValue) < Math.abs(closest - numericValue) ? current : closest;
  });
}

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

    return data;
  } catch (error) {
    console.error("Error fetching estimates:", error);
    throw error;
  }
}

export default fetchEstimatesForTeam;
