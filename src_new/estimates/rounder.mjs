import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function roundEstimate(estimate, scale) {
  if (!estimate) {
    detailedLogger.importantError("No team provided");
    process.exit(1);
  }

  if (!scale) {
    detailedLogger.importantError("No scale provided");
    process.exit(1);
  }

  const numericValue = Number(estimate);

  if (isNaN(numericValue)) return null;

  if (scale.includes(numericValue)) {
    detailedLogger.info(`Exact match found: ${numericValue}`);
    return numericValue;
  }

  let closest = scale[0];
  let minDiff = Math.abs(scale[0] - numericValue);

  for (let i = 1; i < scale.length; i++) {
    const diff = Math.abs(scale[i] - numericValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = scale[i];
    }
  }

  detailedLogger.info(`Closest match found: ${closest}`);

  return closest;
}

export default roundEstimate;
