// import { initializeLogger, setupLogger } from "../logger/init.mjs";
import { initializeLogger } from "../logger/logger.js";
import createStatusesForTeam from "./statuses/create.mjs";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import importEstimates from "./prompts/import_estimates_new.mjs";
import selectTeam from "./teams/select.mjs";
import importFileAttachments from "./prompts/import_file_attachments_new.js";
import importController from "./importer/import_controller.mjs";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectImportSource from "./prompts/select_import_source.js";

import createLabels from "./labels/create.mjs";
import createUserMapping from "./create_user_mapping.mjs";
import { DEFAULT_LABELS } from "./labels/create.mjs";

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
const shouldImportFileAttachments = await importFileAttachments();
const shouldImportLabels = await importLabels();
const { shouldImportEstimates, estimationScale } = await importEstimates(
  team.id,
);

const payload = {
  team: {
    ...team,
    estimationScale,
  },
  options: {
    shouldImportFileAttachments,
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
const sanitizedData = await importController(payload);

//=============================================================================
// Initialize Team Data
//=============================================================================
await createUserMapping({
  team,
  pivotalUsers: sanitizedData.pivotalUsers,
});

await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
await createStatusesForTeam({ teamId: team.id });

const { userConfirmedProceed } = await proceedWithImport({
  releaseStories: newReleaseStories,
  pivotalStories: newPivotalStories,
  successfulImportsLength: successfulImports.size,
  selectedStatusTypes,
});

// function initializeTeamData({ team, data }) {
//   await createLabels({ teamId, labels: LABELS_TO_CREATE });
//   await createStatusesForTeam({ teamId });
// }
