import linearClient from "../../config/client.mjs";
import chalk from "chalk";

export const RELEASE_LABEL_NAME = "pivotal - release";
const FEATURE_LABEL_NAME = "pivotal - feature";
const CHORE_LABEL_NAME = "pivotal - chore";
const BUG_LABEL_NAME = "pivotal - bug";
const EPIC_LABEL_NAME = "pivotal - epic";

export const DEFAULT_LABELS = [
  { name: FEATURE_LABEL_NAME, color: "#ed7d1a" },
  { name: CHORE_LABEL_NAME, color: "#e0e2e5" },
  { name: BUG_LABEL_NAME, color: "#FF5630" },
  { name: RELEASE_LABEL_NAME, color: "#407aa5" },
  { name: EPIC_LABEL_NAME, color: "#452481" },
];

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
          console.log(chalk.green(`✅ Label "${label.name}" created`));
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
    console.log(
      chalk.green(`\nLabels created: ${successful}/${labels.length}`),
    );
    if (failed > 0) {
      console.log(chalk.yellow(`Failed to create: ${failed}`));
    }
  } catch (error) {
    console.error(
      chalk.redBright("Fatal error in label creation process:"),
      error.message,
    );
  }
}

export default createLabels;
