// import { initializeLogger, setupLogger } from "../logger/init.mjs";
import { initializeLogger } from "../logger/initialize.js";
import createStatusesForTeam from "./statuses/create.mjs";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import updateIssueEstimationType from "./estimates/update_issue_estimation_type.js";
// import importEstimates from "./prompts/import_estimates_new.js";
import importEstimates from "./estimates/import_estimates.js";
import selectTeam from "./teams/select.mjs";
import importFiles from "./prompts/import_files.js";
// import importController from "./importer/import_controller.mjs";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectImportSource from "./prompts/select_import_source.js";
import pivotalFormatter from "./importer/pivotal_formatter.js";

import createLabels from "./labels/create.mjs";
import createUserMapping from "./users/create_user_mapping.js";
import { DEFAULT_LABELS } from "./labels/create.mjs";

import selectDirectory from "./prompts/select_csv_directory_new.js";

import createIssues from "./issues/create_issues.js";
import getUserMapping from "./users/get_user_mapping.mjs";

const detailedLogger = new DetailedLogger();

/******************************************************************************
 * IMPORT CONFIGURATION AND EXECUTION
 *
 * This section handles:
 * 1. Team selection
 * 2. Logger initialization
 * 3. Import options configuration (files, labels, estimates)
 * 4. Payload construction and import execution
 ******************************************************************************/

//=============================================================================
// Select Import Source
//=============================================================================
const importSource = await selectImportSource();

//=============================================================================
// Select a Team
//=============================================================================
const team = await selectTeam();

//=============================================================================
// INITIALIZE LOGGER
//=============================================================================
// const logger = setupLogger(team.name);
const logger = initializeLogger({ team });
logger.enable();

//=============================================================================
// Select Directory
//=============================================================================
const directory = await selectDirectory();

//=============================================================================
// Build Import Options
//=============================================================================
// Do you want to import file attachments?
const shouldImportFiles = await importFiles();
const shouldImportLabels = await importLabels();
const shouldImportEstimates = await importEstimates();

// Set new issue estimation type if needed
if (shouldImportEstimates) await updateIssueEstimationType({ team });

const options = {
  shouldImportFiles,
  shouldImportLabels,
  shouldImportEstimates,
};

const meta = {
  directory,
  importSource,
};

detailedLogger.info(`Team: ${JSON.stringify(team, null, 2)}`);
detailedLogger.loading(`Import Source: ${importSource}`);
detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);

// detailedLogger.importantSuccess(`Payload: ${JSON.stringify(payload, null, 2)}`);
// process.exit(0);

//=============================================================================
// Format Data for Import Type
//=============================================================================
// TODO: Modify to swap different data sources, based on importSource
const pivotalData = await pivotalFormatter({ team, directory });

console.log(pivotalData);
process.exit(0);

//=============================================================================
// Create User Mapping
//=============================================================================
await createUserMapping({
  team,
  extractedUsernames: pivotalData.csvData.meta.extractedUsernames,
});

//=============================================================================
// Confirm Proceed
//=============================================================================
await proceedWithImport({
  confirmationMessage: "FANCY CONFIRMATION MESSAGE",
});

//=============================================================================
// Create Labels and Statuses
//=============================================================================
// detailedLogger.importantInfo("Creating labels and statuses...");
// await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
// await createStatusesForTeam({ teamId: team.id });

//=============================================================================
// Create Issues
//=============================================================================

await createIssues({
  team: { id: team.id, name: team.name },
  directory,
  // payload,
  // meta: {
  //   userMapping,
  // },
});

detailedLogger.loading("Importing stories...");

detailedLogger.importantSuccess("Import complete!");
