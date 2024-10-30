import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createLabels({ teamId, labels }) {  
  try {
    console.log(chalk.yellow(`🔄 Creating Labels ${teamId}`));

    for (const label of labels) {
      const response = await linearClient.createIssueLabel({
        teamId,
        name: label.name,
        color: label.color,
      });

      if (response.success) {
        console.log(chalk.green(`✅ Label "${label.name}" created`));
      } else {
        console.error(chalk.red(`Error creating label "${label.name}":`, response.errors));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error creating labels:"), error.message);
  }
}

export default createLabels;