import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createLabels({ teamId, labels }) {  
  try {
    console.log(chalk.yellow(`🔄 Creating Labels...`));

    for (const label of labels) {
      try {
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
      } catch (labelError) {
        console.error(chalk.red(`Failed to create label "${label.name}":`, labelError.message));
        // Continue with next label
      }
    }
  } catch (error) {
    console.error(chalk.red("Fatal error in label creation process:"), error.message);
  }
}

export default createLabels;