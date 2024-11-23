import inquirer from "inquirer";
import chalk from "chalk";
import linearClient from "../../config/client.mjs";
import { ESTIMATION_SCALES } from "../estimates/estimation_scales.js";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function importPivotalEstimates(team) {
  const { shouldImportEstimates } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldImportEstimates",
      message: "Do you want to import estimates?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  detailedLogger.info(`Should import estimates: ${shouldImportEstimates}`);

  if (team.issueEstimation.type) {
    const { changeEstimateType } = await inquirer.prompt([
      {
        type: "list",
        name: "changeEstimateType",
        choices: [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ],
        message: `Your estimation scale is already set to ${
          team.issueEstimation.type
        } (${
          ESTIMATION_SCALES[team.issueEstimation.type]
        }).\n  Pivotal estimates will be rounded to the nearest value. Change it?`,
        default: false,
      },
    ]);

    if (!changeEstimateType) {
      detailedLogger.info(`Estimate type not changed`);
      return { issueEstimation: team.issueEstimation };
    }

    const { issueEstimationType } = await inquirer.prompt([
      {
        type: "list",
        name: "issueEstimationType",
        message: "Select an estimation scale:",
        choices: [
          { name: "Exponential (0,1,2,4,8,16)", value: "exponential" },
          { name: "Fibonacci (0,1,2,3,5,8)", value: "fibonacci" },
          { name: "Linear (0,1,2,3,4,5)", value: "linear" },
        ],
      },
    ]);

    try {
      await linearClient.updateTeam(team.id, { issueEstimationType });

      detailedLogger.success(
        `Updated issue estimation type to ${issueEstimationType}`,
      );
    } catch (error) {
      detailedLogger.error(`Error updating issue estimation type: ${error}`);
    }

    return issueEstimationType;
  }

  return null;
}

export default importPivotalEstimates;
