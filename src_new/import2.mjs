// import { initializeLogger, setupLogger } from "../logger/init.mjs";
import { initializeLogger } from "../logger/logger.js";
import DetailedLogger from "../logger/detailed_logger.mjs";

import selectTeam from "./teams/select.mjs";
import importFileAttachments from "./prompts/import_file_attachments_new.js";

// Select a team
const team = await selectTeam();

// Write all activity to log file
const logger = initializeLogger(team);
logger.enable();

// // Write to log file
// const logger = setupLogger(team.name);
// logger.enable();

// Do you want to import file attachments?
const shouldImportFileAttachments = await importFileAttachments();

const payload = {
  team,
  shouldImportFileAttachments,
};

// Log payload
const detailedLogger = new DetailedLogger();
detailedLogger.info(JSON.stringify(payload, null, 2));
