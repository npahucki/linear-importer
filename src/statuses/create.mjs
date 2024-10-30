import linearClient from "../../config/client.mjs";
import chalk from "chalk";

const BACKLOG_TYPE = 'backlog';
const UNSTARTED_TYPE = 'unstarted';
const COMPLETED_TYPE = 'completed';
const STARTED_TYPE = 'started';
// const CANCELED = 'canceled';
// const TRIAGE = 'triage';

const ACCEPTED = "pivotal - accepted";
const UNSCHEDULED = "pivotal - unscheduled";
const FINISHED = "pivotal - finished";
const PLANNED = "pivotal - planned";
const STARTED = "pivotal - started";

const STATUSES_TO_CREATE = [
  { name: UNSCHEDULED, color: "#6C757D", type: BACKLOG_TYPE }, 
  { name: PLANNED, color: "#e0e2e5", type: UNSTARTED_TYPE },
  { name: STARTED, color: "#f3f3d1", type: STARTED_TYPE }, 
  { name: ACCEPTED, color: "#629200", type: COMPLETED_TYPE },
  { name: FINISHED, color: "#17A2B8", type: COMPLETED_TYPE }, 
];

async function createStatusForTeam({ teamId }) {  
  try {
    console.log(chalk.yellow(`✅ Creating Workflow Statuses for team ${teamId}`));

    for (const status of STATUSES_TO_CREATE) {
      const response = await linearClient.createWorkflowState({
        teamId,
        name: status.name,
        color: status.color,
        type: status.type
      });

      if (response.success) {
        console.log(chalk.green(`✅ Workflow Status "${status.name}" created`));
      } else {
        console.error(chalk.red(`Error creating workflow Status "${status.name}":`, response.errors));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error creating workflow Status:"), error.message);
  }
}

export default createStatusForTeam;