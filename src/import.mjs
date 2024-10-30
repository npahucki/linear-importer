import { REQUESTS_PER_SECOND } from "../config/config.js";
import parseCSV from "./csv/parse.mjs";
import chalk from "chalk";

import selectTeam from "./teams/select.mjs";

import fetchStatuses from "./statuses/list.mjs";

import deleteLabels from "./labels/delete.mjs"
import createLabels from "./labels/create.mjs";
import fetchLabels from "./labels/list.mjs";

import fetchIssuesForTeam from "./issues/list.mjs";
import createIssue from "./issues/create.mjs";

import importFileAttachments from "./prompts/import_file_attachments.js";
import importLabelsFromCSV from "./prompts/import_labels_from_csv.js";
import proceedWithImport from "./prompts/proceed_with_import.js";

// import createEstimates from "./estimates/create.mjs";

import { setupLogger } from '../logger/init.mjs';
import { RELEASE_LABEL_NAME } from "./init.mjs"
import init from "./init.mjs"

const CREATE_ISSUES = true;

// const DELAY = 0
const DELAY = Math.ceil(500 / REQUESTS_PER_SECOND);

const { teamId, teamName } = await selectTeam();
if (!teamId) {
  throw new Error("No team selected");
}

// Write to log file
const logger = setupLogger(teamName);
logger.enable();

// PROMPTS
const { releaseStories, pivotalStories, labels, csvFilename } = await parseCSV();
const { importFiles } = await importFileAttachments();
const { importLabels } = await importLabelsFromCSV();
const { userConfirmedProceed } = await proceedWithImport({ releaseStories, pivotalStories });
// await createEstimates({ teamId }); // TODO: Add prompt to allow choosing issue estimation type

if (userConfirmedProceed) {
  // Delete existing labels
  // await deleteLabels({ teamId })

  // Creates Team Labels and Workflow Statuses
  await init({ teamId })

  // Create Labels from CSV
  if (importLabels) await createLabels({ teamId, labels });
  
  const teamStatuses = await fetchStatuses({ teamId });
  const teamLabels = await fetchLabels({ teamId });

  const processReleaseStories = async () => {
    if (releaseStories?.length === 0) {
      console.log(chalk.yellow("No Release Stories found in the CSV file."));
    } else { 
      console.log(chalk.cyan(`Converting ${releaseStories.length} Release Stories into Linear Cycles for Team ${teamName} -${teamId}`));
      
      for (const [index, pivotalStory] of releaseStories.entries()) {
        const stateId = teamStatuses.find(state => state.name === `pivotal - ${pivotalStory.state}`)?.id;
        const pivotalStoryTypeLabelId = teamLabels.find(label => label.name === `pivotal - ${pivotalStory.type}`)?.id;
        const otherLabelIds = pivotalStory.labels ? pivotalStory.labels.split(',')
            .map(label => label.trim())
            .map(label => teamLabels.find(teamLabel => teamLabel.name === label)?.id)
            .filter(id => id)
        : [];
      const labelIds = [pivotalStoryTypeLabelId, ...otherLabelIds].filter(Boolean);
        
        const importNumber = index + 1;
        await new Promise(resolve => setTimeout(resolve, DELAY));
        await createIssue({
          teamId,
          pivotalStory,
          stateId,
          labelIds,
          importNumber,
          csvFilename,
          importFiles
        });
      }
    }
  };

  // Process Release Stories first
  if (CREATE_ISSUES) await processReleaseStories();

  // Add delay to ensure synchronicity
  await new Promise(resolve => setTimeout(resolve, DELAY * 2));
  
  // Process Pivotal Stories
  const processPivotalStories = async () => {
    if (pivotalStories?.length === 0) {
      console.log("No Pivotal Stories found in the CSV file.");
    } else { 
      console.log(chalk.cyan(`Converting ${pivotalStories.length} Pivotal Stories into Linear Issues for Team ${teamId}`));

      // Fetch all release issues
      const releaseIssues = await fetchIssuesForTeam({ teamId, filters: { labels: { some: { name: { eq: RELEASE_LABEL_NAME } } } } });

      for (const [index, pivotalStory] of pivotalStories.entries()) {
        const parentIssue = releaseIssues?.find(releaseIssue => releaseIssue.title.includes(`[${pivotalStory.iteration}]`));
        const stateId = teamStatuses.find(state => state.name === `pivotal - ${pivotalStory.state}`)?.id;
        const pivotalStoryTypeLabelId = teamLabels.find(label => label.name === `pivotal - ${pivotalStory.type}`)?.id;
        const otherLabelIds = pivotalStory.labels ? pivotalStory.labels.split(',')
            .map(label => label.trim())
            .map(label => teamLabels.find(teamLabel => teamLabel.name === label)?.id)
            .filter(id => id)
        : [];
      const labelIds = [pivotalStoryTypeLabelId, ...otherLabelIds].filter(Boolean);

        const importNumber = index + 1;
        await new Promise(resolve => setTimeout(resolve, DELAY));
        await createIssue({
          teamId,
          pivotalStory,
          stateId,
          labelIds,
          parentId: parentIssue?.id,
          importNumber,
          csvFilename,
          importFiles
        });
      }
    }
  };

  // Process all remaining Pivotal Stories
  if (CREATE_ISSUES) await processPivotalStories();
}

// Close Logger
process.on('exit', () => {
  logger.close();
});
