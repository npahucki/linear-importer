import linearClient from "../../config/client.mjs";
import { ISSUE_ESTIMATION_OPTIONS } from "./estimation_scales.js";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import chalk from "chalk";

import { detailedLogger } from "../../logger/logger_instance.js";

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

async function fetchIssueEstimationSettings(teamId) {
  if (!teamId) {
    detailedLogger.importantError("Team ID not provided");
    process.exit(1);
  }

  try {
    const team = await linearClient.team(teamId);

    const type = team.issueEstimationType;
    const allowZero = team.issueEstimationAllowZero;
    const extended = team.issueEstimationExtended;

    // Find correct base values
    const estimationScaleByType =
      ISSUE_ESTIMATION_OPTIONS.find((option) => option.value === type)?.scale ||
      [];

    const choices = ISSUE_ESTIMATION_OPTIONS.map((option) => ({
      name: `${option.value} (${option.scale.regular.join(", ")}) [Extended: ${option.scale.extended.join(", ")}]`,
      value: option.value,
    }));

    // Find scale based using `extended` type
    const scaleToUse = extended
      ? estimationScaleByType.extended
      : estimationScaleByType.regular;

    // Filter out zero if not allowed
    const scale = (scaleToUse || []).filter(
      (value) => allowZero || value !== 0,
    );

    // Create details to be displayed in prompt
    const details = [
      `Current Issue estimation settings:`,
      `  Type: ${chalk.cyan(type)} (${chalk.cyan(scale.join(", "))})`,
      `  Allow zero estimates: ${chalk.cyan(allowZero)}`,
      `  Extended estimate scale: ${chalk.cyan(extended)}\n`,
    ].join("\n");

    const data = {
      type,
      allowZero,
      extended,
      scale,
      details,
      choices,
    };

    // TODO
    // detailedLogger.success(
    //   `issueEstimationDetails: ${JSON.stringify(data, null, 2)}`,
    // );

    return data;
  } catch (error) {
    detailedLogger.importantError(
      `Error fetching issueEstimationDetails: ${error}`,
    );
    process.exit(1);
  }
}

export default fetchIssueEstimationSettings;
