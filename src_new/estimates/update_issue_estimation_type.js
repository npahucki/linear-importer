import inquirer from "inquirer";

import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

import fetchEstimatesForTeam from "./list.mjs";
import { ISSUE_ESTIMATION_OPTIONS } from "./estimation_scales.js";
import chalk from "chalk";

const detailedLogger = new DetailedLogger();

async function updateIssueEstimationType({ team }) {
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: team.id,
  });

  const { shouldChangeIssueEstimationType } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldChangeIssueEstimationType",
      message: `Issue estimation is set to ${chalk.cyan(
        ISSUE_ESTIMATION_OPTIONS.find(
          (option) => option.value === issueEstimation.type,
        ).name,
      )}.\n  Estimates will be rounded to the nearest value. Change it?`,
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: false,
    },
  ]);

  if (!shouldChangeIssueEstimationType) {
    detailedLogger.info(
      `Estimate type not changed. Keeping ${issueEstimation.type} (${issueEstimation.scale})`,
    );
    return;
  }

  const { issueEstimationType } = await inquirer.prompt([
    {
      type: "list",
      name: "issueEstimationType",
      message: "Select a new issue estimation type:",
      choices: ISSUE_ESTIMATION_OPTIONS,
    },
  ]);

  try {
    await linearClient.updateTeam(team.id, { issueEstimationType });

    detailedLogger.importantSuccess(
      `Updated issue estimation type to ${
        ISSUE_ESTIMATION_OPTIONS.find(
          (option) => option.value === issueEstimationType,
        ).name
      }`,
    );

    return;
  } catch (error) {
    detailedLogger.error(`Error updating issue estimation type: ${error}`);
    process.exit(1);
  }
}

export default updateIssueEstimationType;
