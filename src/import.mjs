import { REQUESTS_PER_SECOND } from "../config/config.js";
import parseCSV, { parseCSVFile } from "./csv/parse.mjs";
import chalk from "chalk";
import fs from 'fs/promises';

import selectTeam from "./teams/select.mjs";
import fetchStatuses from "./statuses/list.mjs";
import deleteLabels from "./labels/delete.mjs";
import createLabels from "./labels/create.mjs";
import fetchLabels from "./labels/list.mjs";
import fetchIssuesForTeam from "./issues/list.mjs";
import createIssue from "./issues/create.mjs";

import importFileAttachments from "./prompts/import_file_attachments.js";
import importLabelsFromCSV from "./prompts/import_labels_from_csv.js";
import selectStatusTypes from "./prompts/select_status_types.js";
import proceedWithImport from "./prompts/proceed_with_import.js";

// import createEstimates from "./estimates/create.mjs";

import { setupLogger } from '../logger/init.mjs';
import { RELEASE_LABEL_NAME } from "./init.mjs";
import init from "./init.mjs";
import readSuccessfulImports from '../logger/read_successful_imports.mjs';

import logSuccessfulImport from '../logger/log_successful_import.mjs';

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
const { releaseStories, pivotalStories, statusTypes, labels, csvFilename } = await parseCSV();
const { importFiles } = await importFileAttachments();
const { importLabels } = await importLabelsFromCSV();
const { selectedStatusTypes } = await selectStatusTypes(statusTypes);
const successfulImports = await readSuccessfulImports(teamName);

const newReleaseStories = releaseStories.filter(story => !successfulImports.has(story.id));
    // Filter pivotal stories based on selectedStatusTypes
  const newPivotalStories = pivotalStories.filter(story => 
    selectedStatusTypes.includes(story.type.toLowerCase()) && 
    !successfulImports.has(story.id)
  );

const { userConfirmedProceed } = await proceedWithImport({ releaseStories: newReleaseStories, pivotalStories: newPivotalStories, successfulImportsLength: successfulImports.size, selectedStatusTypes });
// await createEstimates({ teamId }); // TODO: Add prompt to allow choosing issue estimation type

if (userConfirmedProceed) {
  // Delete existing labels
  // await deleteLabels({ teamId })

  // Creates Team Labels and Workflow Statuses
  await init({ teamId });

  // Create Labels from CSV
  if (importLabels) await createLabels({ teamId, labels });

  const teamStatuses = await fetchStatuses({ teamId });
  const teamLabels = await fetchLabels({ teamId });

  const processReleaseStories = async () => {
    if (newReleaseStories?.length === 0) {
      console.log(chalk.yellow("No Release Stories found in the CSV file."));
    } else {
      console.log(chalk.cyan(`Converting ${newReleaseStories.length} Release Stories into Linear Cycles for Team ${teamName} -${teamId}`));

      for (const [index, pivotalStory] of newReleaseStories.entries()) {
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
        
        try {
          await createIssue({
            teamId,
            pivotalStory,
            stateId,
            labelIds,
            importNumber,
            csvFilename,
            importFiles
          });
          await logSuccessfulImport(pivotalStory.id, teamName);
        } catch (error) {
          console.error(`Failed to import release story ${pivotalStory.id}:`, error);
        }
      }
    }
  };

  // Process Release Stories first
  if (CREATE_ISSUES) {
    if (selectedStatusTypes.includes('release')) {
      await processReleaseStories();
    }
  }

  // Add delay to ensure synchronicity
  await new Promise(resolve => setTimeout(resolve, DELAY * 2));

  // Process Pivotal Stories
  const processPivotalStories = async () => {
    if (newPivotalStories?.length === 0) {
      console.log("No Pivotal Stories found in the CSV file.");
    } else {
      console.log(chalk.cyan(`Converting ${newPivotalStories.length} Pivotal Stories into Linear Issues for Team ${teamId}`));

      // Fetch all release issues
      const releaseIssues = await fetchIssuesForTeam({ teamId, filters: { labels: { some: { name: { eq: RELEASE_LABEL_NAME } } } } });

      for (const [index, pivotalStory] of newPivotalStories.entries()) {
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
        
        try {
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
          await logSuccessfulImport(pivotalStory.id, teamName);
        } catch (error) {
          console.error(`Failed to import story ${pivotalStory.id}:`, error);
        }
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