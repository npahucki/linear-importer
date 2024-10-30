import linearClient from "../../config/client.mjs";
import chalk from 'chalk';

async function createEstimates({ teamId }) {
  try {
    // Fetch the team
    const team = await linearClient.team(teamId);

    const issueEstimationType = 'exponential'

    // Check if estimates are enabled and enable them if needed
    if (!team.issueEstimationAllowed) {
      await team.update({
        issueEstimationType,
        issueEstimationExtended: false,
        issueEstimationAllowZero: true,
      });
    }    

    // console.log(chalk.green('✅ Issue Estimation enabled:') chalk.cyan(`${issueEstimationType}`));
    console.log(chalk.green('✅ Issue Estimation enabled:'), chalk.cyan(`${issueEstimationType}`));

  } catch (error) {
    console.error('Error fetching estimates:', error.message);
    return { estimates: [] };
  }
}

export default createEstimates;