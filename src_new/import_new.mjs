import { initializeLogger } from "../logger/initialize.js";
import createStatusesForTeam from "./statuses/create.mjs";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import updateIssueEstimationType from "./estimates/update_issue_estimation_type.js";
import importEstimates from "./estimates/import_estimates.js";
import selectTeam from "./teams/select.mjs";
import importFiles from "./prompts/import_files.js";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectImportSource from "./prompts/select_import_source.js";
import pivotalFormatter from "./importer/pivotal_formatter.js";
import createLabels from "./labels/create.mjs";
import createUserMapping from "./users/create_user_mapping.js";
import { DEFAULT_LABELS } from "./labels/create.mjs";
import selectDirectory from "./prompts/select_csv_directory_new.js";
import createIssues from "./issues/create_issues.js";

const detailedLogger = new DetailedLogger();

//=============================================================================
// Select Import Source
//=============================================================================
const importSource = await selectImportSource();

//=============================================================================
// Select a Team
//=============================================================================
const team = await selectTeam();

//=============================================================================
// Initialize Logger
//=============================================================================
initializeLogger({ team });

//=============================================================================
// Select Directory
//=============================================================================
const directory = await selectDirectory();

//=============================================================================
// Build Import Options
//=============================================================================
const shouldImportFiles = await importFiles();
const shouldImportLabels = await importLabels();
const shouldImportEstimates = await importEstimates();
if (shouldImportEstimates) await updateIssueEstimationType({ team });

const options = {
  shouldImportFiles,
  shouldImportLabels,
  shouldImportEstimates,
};

detailedLogger.info(`Import Source: ${importSource}`);
detailedLogger.info(`Team: ${JSON.stringify(team, null, 2)}`);
detailedLogger.info(`Directory: ${directory}`);
detailedLogger.info(`Options: ${JSON.stringify(options, null, 2)}`);
// detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);

//=============================================================================
// Format Data for Import Type
//=============================================================================
// TODO: Modify to swap different data sources, based on importSource
const { csvData, confirmationMessage } = await pivotalFormatter({ directory });

//=============================================================================
// Create User Mapping
//=============================================================================
await createUserMapping({
  team,
  extractedUsernames: csvData.aggregatedData.userNames,
});

//=============================================================================
// Confirm Proceed
//=============================================================================
await proceedWithImport({ confirmationMessage });

//=============================================================================
// Create Labels and Statuses
//=============================================================================
// detailedLogger.importantInfo("Creating labels and statuses...");
await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
await createStatusesForTeam({ teamId: team.id });

//=============================================================================
// Create Issues
//=============================================================================
await createIssues({
  team,
  payload: csvData,
  options,
});

detailedLogger.importantSuccess("Import complete!");
