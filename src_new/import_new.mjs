// import { initializeLogger, setupLogger } from "../logger/init.mjs";
import { initializeLogger } from "../logger/logger.js";
import createStatusesForTeam from "./statuses/create.mjs";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import updateIssueEstimationType from "./estimates/update_issue_estimation_type.js";
// import importEstimates from "./prompts/import_estimates_new.js";
import importEstimates from "./estimates/import_estimates.js";
import selectTeam from "./teams/select.mjs";
import importFiles from "./prompts/import_files.js";
import importController from "./importer/import_controller.mjs";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectImportSource from "./prompts/select_import_source.js";
import pivotalFormatter from "./importer/pivotal_formatter.js";

import createLabels from "./labels/create.mjs";
import createUserMapping from "./users/create_user_mapping.js";
import { DEFAULT_LABELS } from "./labels/create.mjs";

import selectDirectory from "./prompts/select_csv_directory_new.js";

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
const logger = initializeLogger(team);
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
const issueEstimation = await updateIssueEstimationType(
  team,
  shouldImportEstimates,
);

const payload = {
  team: {
    ...team,
    issueEstimation,
  },
  options: {
    shouldImportFiles,
    shouldImportLabels,
    shouldImportEstimates,
  },
  meta: {
    directory,
    importSource,
  },
};

// detailedLogger.importantSuccess(`Payload: ${JSON.stringify(payload, null, 2)}`);
// process.exit(0);

//=============================================================================
// Format Data for Import Type
//=============================================================================
// TODO: Modify to swap different data sources, based on importSource
const pivotalData = await pivotalFormatter(payload);

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
  confirmationMessage: "logging message here",
});

//=============================================================================
// Create Labels and Statuses
//=============================================================================

detailedLogger.importantInfo("Creating labels and statuses...");
await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
await createStatusesForTeam({ teamId: team.id });

detailedLogger.loading("Importing stories...");

detailedLogger.importantSuccess("Import complete!");
