import inquirer from "inquirer";

import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

import { ESTIMATION_SCALES } from "./estimation_scales.js";

import chalk from "chalk";

const detailedLogger = new DetailedLogger();

async function updateIssueEstimationType({ team }) {
  const message = `Issue estimation is set to ${chalk.yellow(
    `${team.issueEstimation.type} (${team.issueEstimation.scale})`,
  )}.\n  Pivotal estimates will be rounded to the nearest value. Change it?`;

  const { shouldChangeIssueEstimationType } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldChangeIssueEstimationType",
      message,
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: false,
    },
  ]);

  if (!shouldChangeIssueEstimationType) {
    detailedLogger.info(
      `Estimate type not changed. Keeping ${team.issueEstimation.type} (${team.issueEstimation.scale})`,
    );
    return;
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

    detailedLogger.importantSuccess(
      `Updated issue estimation type to ${ESTIMATION_SCALES[issueEstimationType]}`,
    );

    return;
  } catch (error) {
    detailedLogger.error(`Error updating issue estimation type: ${error}`);
    process.exit(1);
  }
}

export default updateIssueEstimationType;
