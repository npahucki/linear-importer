import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createLabels({ teamId, labels }) {  
  try {
    console.log(chalk.yellow(`🔄 Creating ${labels.length} labels...`));
    
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
          console.error(chalk.red(`Error creating label "${label.name}":`, response.errors));
        }
      } catch (labelError) {
        failed++;
        console.error(chalk.red(`Failed to create label "${label.name}":`, labelError.message));
      }
    }

    // Show summary at the end
    console.log(chalk.cyan(`\nLabels created: ${successful}/${labels.length}`));
    if (failed > 0) {
      console.log(chalk.yellow(`Failed to create: ${failed}`));
    }
  } catch (error) {
    console.error(chalk.red("Fatal error in label creation process:"), error.message);
  }
}

export default createLabels;