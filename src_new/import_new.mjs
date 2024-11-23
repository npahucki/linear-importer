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
import pivotal from "./importer/pivotal.mjs";

import createLabels from "./labels/create.mjs";
import createUserMapping from "./create_user_mapping.mjs";
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

const issueEstimation = await updateIssueEstimationType(team);

const payload = {
  team,
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

//=============================================================================
// Format Data for Import Type
//=============================================================================
// I need to document the expected shape of`sanitizedDAta`. it should have users,
// const sanitizedData = await importController(payload);
const { csvData } = await pivotal(payload);

console.log("csvData", csvData);

//=============================================================================
// Create User Mapping
//=============================================================================
// await createUserMapping({
//   team,
//   extractedUsernames: csvData.extractedUsernames,
// });

//=============================================================================
// Confirm Proceed
//=============================================================================
const userConfirmedProceed = await proceedWithImport({
  confirmationMessage: "logging message here",
});

//=============================================================================
// Create Labels and Statuses
//=============================================================================

console.log("start doing things...");
// await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
// await createStatusesForTeam({ teamId: team.id });

process.exit(0);

detailedLogger.importantSuccess("Import complete!");
