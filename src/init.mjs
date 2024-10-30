import createLabels from './labels/create.mjs';
import createStatusesForTeam from './statuses/create.mjs';
import chalk from 'chalk';

export const RELEASE_LABEL_NAME = "pivotal - release";
const FEATURE_LABEL_NAME = "pivotal - feature";
const CHORE_LABEL_NAME = "pivotal - chore";
const BUG_LABEL_NAME = "pivotal - bug";
const EPIC_LABEL_NAME = "pivotal - epic";

const LABELS_TO_CREATE = [
  { name: FEATURE_LABEL_NAME, color: "#ed7d1a" },
  { name: CHORE_LABEL_NAME, color: "#e0e2e5" },  
  { name: BUG_LABEL_NAME, color: "#FF5630" },     
  { name: RELEASE_LABEL_NAME, color: "#407aa5" }, 
  { name: EPIC_LABEL_NAME, color: "#452481" },
];

async function init({ teamId }) {
  console.log(chalk.yellow('Initializing workspace...'));
  
  await createLabels({ teamId, labels: LABELS_TO_CREATE });
  await createStatusesForTeam({ teamId });

  console.log(chalk.yellow('Initialization complete.'));
}

export default init;
