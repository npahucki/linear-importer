import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function deleteLabels({ teamId }) {
  try {
    console.log(chalk.cyan(`🔄 Deleting Labels for team ${teamId}`));
    
    // First, fetch all labels for the team
    const labels = await linearClient.issueLabels({
      filter: {
        team: { id: { eq: teamId } }
      }
    });

    // Delete each label
    for (const label of labels.nodes) {
      const response = await linearClient.deleteIssueLabel(label.id);
      
      if (response.success) {
        console.log(chalk.green(`✅ Label "${label.name}" deleted`));
      } else {
        console.error(chalk.red(`Error deleting label "${label.name}":`, response.errors));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error deleting labels:"), error.message);
  }
}
export default deleteLabels;