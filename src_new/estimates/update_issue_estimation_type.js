import inquirer from "inquirer";

import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

import chalk from "chalk";

const detailedLogger = new DetailedLogger();

async function updateIssueEstimationType(team) {
  if (team.issueEstimation.type) {
    const message = `Your estimation scale is already set to ${chalk.yellow(
      `${team.issueEstimation.type} (${team.issueEstimation.scale})`,
    )}.\n  Pivotal estimates will be rounded to the nearest value. Change it?`;

    const { changeEstimateType } = await inquirer.prompt([
      {
        type: "list",
        name: "changeEstimateType",
        message,
        choices: [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ],
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
}

export default updateIssueEstimationType;
