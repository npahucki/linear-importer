import linearClient from "../../config/client.mjs";
import { ISSUE_ESTIMATION_OPTIONS } from "./estimation_scales.js";

export function findClosestEstimate(value, scale) {
  if (!scale || !value) return null;

  const numericValue = Number(value);
  if (isNaN(numericValue)) return null;

  return scale.reduce((closest, current) => {
    return Math.abs(current - numericValue) < Math.abs(closest - numericValue)
      ? current
      : closest;
  });
}

async function fetchEstimatesForTeam({ teamId }) {
  if (!teamId) {
    throw new Error("teamId is required");
  }

  try {
    const team = await linearClient.team(teamId);
    const issueEstimationType = await team.issueEstimationType;

    const estimationScale = ISSUE_ESTIMATION_OPTIONS.find(
      (option) => option.value === issueEstimationType,
    )?.scale;

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
