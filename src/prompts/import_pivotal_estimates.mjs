import inquirer from "inquirer";
import fetchEstimatesForTeam from "../estimates/list.mjs";
import chalk from "chalk";
import linearClient from "../../config/client.mjs";
import { ESTIMATION_SCALES } from "../estimates/estimation_scales.js";

async function importPivotalEstimates({ teamId }) {
  const { importEstimates } = await inquirer.prompt([
    {
      type: "list",
      name: "importEstimates",
      message: "Do you want to import estimates?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: true,
    },
  ]);

  if (importEstimates) {
    const estimateData = await fetchEstimatesForTeam({ teamId });

    if (!estimateData.type) {
      console.log(chalk.yellow('⚠️  No estimation type found. Please set one.'));
    }

    const { estimationScale } = await inquirer.prompt([
      {
        type: "list",
        name: "estimationScale",
        message: estimateData.type 
          ? `Your estimation scale is currently ${estimateData.type} (${ESTIMATION_SCALES[estimateData.type]}). Select a new scale:`
          : "Select an estimation scale:",
        choices: [
          { name: "Exponential (0,1,2,4,8,16)", value: "exponential" },
          { name: "Fibonacci (0,1,2,3,5,8)", value: "fibonacci" },
          { name: "Linear (0,1,2,3,4,5)", value: "linear" },
        ],
      },
    ]);

    await linearClient.updateTeam(teamId, {
      issueEstimationType: estimationScale,
    });

    console.log(
      chalk.green(
        `✅ Team Estimation Scale updated to *${chalk.magenta(
          estimationScale,
        )}*`,
      ),
    );

    return estimationScale;
  }

  return null;
}

export default importPivotalEstimates;