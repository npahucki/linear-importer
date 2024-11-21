import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createLabels({ teamId, labels }) {  
  try {
    console.log(chalk.cyan(`🔄 Creating ${labels.length} labels...`));
    
    let successful = 0;
    let failed = 0;

    for (const label of labels) {
      try {
        const response = await linearClient.createIssueLabel({
          teamId,
          name: label.name,
          color: label.color,
        });

        if (response.success) {
          successful++;
        } else {
          failed++;
          console.error(chalk.dim.yellow(`${response.errors}. Skipping...`));
        }
      } catch (labelError) {
        failed++;
        console.error(chalk.dim.yellow(`${labelError.message}. Skipping...`));
      }
    }

    // Show summary at the end
    console.log(chalk.green(`\nLabels created: ${successful}/${labels.length}`));
    if (failed > 0) {
      console.log(chalk.yellow(`Failed to create: ${failed}`));
    }
  } catch (error) {
    console.error(chalk.redBright("Fatal error in label creation process:"), error.message);
  }
}

export default createLabels;