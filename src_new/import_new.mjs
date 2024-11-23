// import { initializeLogger, setupLogger } from "../logger/init.mjs";
import { initializeLogger } from "../logger/logger.js";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import importEstimates from "./prompts/import_estimates_new.mjs";
import selectTeam from "./teams/select.mjs";
import importFileAttachments from "./prompts/import_file_attachments_new.js";
import importController from "./importer/import_controller.mjs";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectStatusTypes from "./prompts/select_status_types.js";

// import { createIssue } from "./issues/create_new.mjs";

import selectDirectory from "./prompts/select_csv_directory_new.js";

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
// BEGIN PROMPTS
//=============================================================================
// Select a team
const team = await selectTeam();

//=============================================================================
// INITIALIZE LOGGER
//=============================================================================
// const logger = setupLogger(team.name);
const logger = initializeLogger(team);
logger.enable();

//=============================================================================
// SELECT DIRECTORY
//=============================================================================
const directory = await selectDirectory();

//=============================================================================
// BUILD IMPORT OPTIONS
//=============================================================================
// Do you want to import file attachments?
const shouldImportFileAttachments = await importFileAttachments();
const shouldImportLabels = await importLabels();
const { shouldImportEstimates, estimationScale } = await importEstimates(
  team.id,
);
const { selectedStatusTypes } = await selectStatusTypes();

const options = {
  shouldImportFileAttachments,
  shouldImportLabels,
  shouldImportEstimates,
};

const payload = {
  data: {},
  team: {
    ...team,
    estimationScale,
  },
  options,
  meta: {
    directory,
    importSource: "pivotal",
  },
};

importController(payload);

// Log payload
// const payloadWithoutData = Object.fromEntries(
//   Object.entries(payload).filter(([key]) => key !== "data"),
// );
// detailedLogger.info(JSON.stringify(payloadWithoutData, null, 2));
