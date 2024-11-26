import linearClient from "../../config/client.mjs";
import { ISSUE_ESTIMATION_OPTIONS } from "./estimation_scales.js";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

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

async function fetchIssueEstimationDetails({ teamId }) {
  if (!teamId) {
    detailedLogger.importantError("Team ID not provided");
    process.exit(1);
  }

  try {
    const team = await linearClient.team(teamId);

    const type = team.issueEstimationType;
    const allowZero = team.issueEstimationAllowZero;
    const extended = team.issueEstimationExtended;

    // Use map to
    const estimationScaleByType = ISSUE_ESTIMATION_OPTIONS.find(
      (option) => option.value === type,
    ).scale;

    const scale = estimationScaleByType.filter(
      (value) => allowZero || value !== 0,
    );

    const data = {
      type,
      allowZero,
      extended,
      scale,
    };

    detailedLogger.success(
      `issueEstimationDetails: ${JSON.stringify(data, null, 2)}`,
    );

    return data;
  } catch (error) {
    detailedLogger.importantError(
      `Error fetching issueEstimationDetails: ${error}`,
    );
    process.exit(1);
  }
}

export default fetchIssueEstimationDetails;
