import inquirer from "inquirer";

import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

import fetchIssueEstimationSettings from "./list.mjs";
import { ISSUE_ESTIMATION_OPTIONS } from "./estimation_scales.js";
import chalk from "chalk";

const detailedLogger = new DetailedLogger();

async function updateIssueEstimationType({ team }) {
  const { details, choices } = await fetchIssueEstimationSettings(team.id);

  const { shouldChangeIssueEstimationType } = await inquirer.prompt([
    {
      type: "list",
      name: "shouldChangeIssueEstimationType",
      message: `${details}\nEstimates will be rounded to the nearest value. Change it?`,
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: false,
    },
  ]);

  if (!shouldChangeIssueEstimationType) {
    detailedLogger.info(`Estimate type not changed. Keeping ${details})`);
    return;
  }

  // First select the estimation type
  const { issueEstimationType } = await inquirer.prompt([
    {
      type: "list",
      name: "issueEstimationType",
      message: "Select estimation type:",
      choices,
    },
  ]);

  // Then select additional options
  const { allowZero, extended } = await inquirer.prompt([
    {
      type: "list",
      name: "allowZero",
      message: "Allow zero as an estimate value?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
    {
      type: "list",
      name: "extended",
      message: "Use extended estimate scale? (normally not recommended)",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: false,
    },
  ]);

  try {
    await linearClient.updateTeam(team.id, {
      issueEstimationType,
      issueEstimationAllowZero: allowZero,
      issueEstimationExtended: extended,
    });

    const selectedOption = ISSUE_ESTIMATION_OPTIONS.find(
      (option) => option.value === issueEstimationType,
    );

    const scale = extended
      ? selectedOption.scale.extended
      : selectedOption.scale.regular;
    const finalScale = allowZero ? scale : scale.filter((v) => v !== 0);

    detailedLogger.importantSuccess(
      `Updated issue estimation type to ${selectedOption.value} (${finalScale.join(", ")})\n` +
        `  • Allow zero estimates: ${chalk.cyan(allowZero ? "Yes" : "No")}\n` +
        `  • Extended scale: ${chalk.cyan(extended ? "Yes" : "No")}`,
    );
  } catch (error) {
    detailedLogger.error(`Error updating issue estimation type: ${error}`);
    process.exit(1);
  }
}

export default updateIssueEstimationType;
