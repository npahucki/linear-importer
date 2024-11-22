import { ENABLE_DETAILED_LOGGING } from "../../config/config.js";
import { ESTIMATION_SCALES } from "./estimation_scales.js";
import chalk from "chalk";

export function findClosestEstimate(value, estimationScale) {
  if (!estimationScale || !value) return null;

  const scale = ESTIMATION_SCALES[estimationScale];

  if (!scale) return null;
  const numericValue = Number(value);

  if (isNaN(numericValue)) return null;

  if (ENABLE_DETAILED_LOGGING) {
    console.log("value", value);
    console.log(chalk.magenta("estimationScale"), estimationScale);
    console.log(chalk.magenta("scale"), scale);
  }

  if (scale.includes(numericValue)) {
    if (ENABLE_DETAILED_LOGGING) {
      console.log(chalk.magenta("exact match found:"), numericValue);
    }
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

  if (ENABLE_DETAILED_LOGGING) {
    console.log(chalk.magenta("closest"), closest);
  }

  return closest;
}
