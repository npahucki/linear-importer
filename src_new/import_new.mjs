import { initializeLogger } from "../logger/initialize.js";
import createStatusesForTeam from "./statuses/create.mjs";
import DetailedLogger from "../logger/detailed_logger.mjs";
import importLabels from "./prompts/import_labels_new.js";
import importComments from "./prompts/import_comments.js";
import updateIssueEstimationType from "./estimates/update_issue_estimation_type.js";
import importEstimates from "./estimates/import_estimates.js";
import importPriority from "./priority/import_priority.js";
import selectTeam from "./teams/select.mjs";
import importFiles from "./prompts/import_files.js";
import proceedWithImport from "./prompts/proceed_with_import_new.js";
import selectImportSource from "./prompts/select_import_source.js";
import pivotalFormatter from "./import_sources/pivotal/formatter.js";
import createLabels from "./labels/create.mjs";
import createUserMapping from "./users/create_user_mapping.js";
import { DEFAULT_LABELS } from "./labels/create.mjs";
import selectDirectory from "./prompts/select_csv_directory_new.js";
// import createIssues from "./issues/create_issues.js";
import createIssues from "./issues/create.js";

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
// const shouldImportFiles = await importFiles();
// const shouldImportLabels = await importLabels();
// const shouldImportComments = await importComments();
// const shouldImportPriority = await importPriority();
// const shouldImportEstimates = await importEstimates();
// if (shouldImportEstimates) await updateIssueEstimationType({ team });

const options = {
  shouldImportFiles: false,
  shouldImportLabels: false,
  shouldImportComments: false,
  shouldImportPriority: false,
  shouldImportEstimates: false,
};

//=============================================================================
// Format Data for Import Type
//=============================================================================
// TODO: Modify to swap different data sources, based on importSource
const extractedPivotalData = await pivotalFormatter({
  team,
  directory,
});

//=============================================================================
// Create User Mapping
//=============================================================================
await createUserMapping({
  team,
  extractedUsernames: extractedPivotalData.csvData.aggregatedData.userNames,
});

detailedLogger.info(`Import Source: ${importSource}`);
detailedLogger.info(`Team: ${JSON.stringify(team, null, 2)}`);
detailedLogger.info(`Directory: ${directory}`);
detailedLogger.info(`Options: ${JSON.stringify(options, null, 2)}`);

//=============================================================================
// Confirm Proceed
//=============================================================================
await proceedWithImport({
  confirmationMessage: extractedPivotalData.confirmationMessage,
});

//=============================================================================
// Create Labels and Statuses
//=============================================================================
// await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
// await createLabels({ teamId: team.id, labels: csvData.aggregatedData.labels });
// await createStatusesForTeam({ teamId: team.id });

//=============================================================================
// Create Issues
//=============================================================================
await createIssues({
  team,
  issuesPayload: extractedPivotalData.csvData.issues,
  options,
  importSource,
  directory,
});

await detailedLogger.importantSuccess("Import complete!");
