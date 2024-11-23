import DetailedLogger from "../../logger/detailed_logger.mjs";

import importPivotalStory from "./pivotal.mjs";
import parseCSV from "../csv/parse_new.mjs";
import proceedWithImport from "../prompts/proceed_with_import_new.js";

const detailedLogger = new DetailedLogger();

async function importController({ data, team, options, meta }) {
  detailedLogger.info(`🔸 Starting import for team ${team.name}`);
  detailedLogger.loading(`Import Source: ${meta.importSource}`);
  console.log("--------------------------------");
  detailedLogger.info(`Data: ${JSON.stringify(data, null, 2)}`);
  detailedLogger.warning(`Team: ${JSON.stringify(team, null, 2)}`);
  detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
  detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);
  console.log("--------------------------------");

  // Main logging statement
  detailedLogger.importantSuccess(`Processing ${meta.importSource} stories...`);

  switch (meta.importSource) {
    case "pivotal":
      importPivotalStory({ data, team, options, meta });
      // Parse CSV
      const csvData = await parseCSV(meta.directory);
      detailedLogger.info(`CSV Data: ${JSON.stringify(csvData, null, 2)}`);

      // import selectStatusTypes from "./prompts/select_status_types.js";
      // const { selectedStatusTypes } = await selectStatusTypes();

      return true;

    default:
      throw new Error(`Unknown import source: ${meta.importSource}`);
  }
}

export default importController;

// const response = {
//   status: "sucess",
//   body: "hey",
// };

// detailedLogger.success(`Response: ${JSON.stringify(response, null, 2)}`);

// return response;
