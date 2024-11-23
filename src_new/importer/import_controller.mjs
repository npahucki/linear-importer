import DetailedLogger from "../../logger/detailed_logger.mjs";

import createLabels from "../labels/create.mjs";
import createStatusesForTeam from "../statuses/create.mjs";
import importPivotalStory from "./pivotal.mjs";
import parseCSV from "../csv/parse_new.mjs";
import proceedWithImport from "../prompts/proceed_with_import_new.js";
import createUserMapping from "../create_user_mapping.mjs";
import { DEFAULT_LABELS } from "../labels/create.mjs";

const detailedLogger = new DetailedLogger();

// this file is responsible for shaping data for different import sources

// importTypeDataProcessor
async function importController({ team, options, meta }) {
  detailedLogger.info(`🔸 Starting import for team ${team.name}`);
  detailedLogger.loading(`Import Source: ${meta.importSource}`);
  console.log("--------------------------------");
  // detailedLogger.info(`Data: ${JSON.stringify(data, null, 2)}`);
  detailedLogger.warning(`Team: ${JSON.stringify(team, null, 2)}`);
  detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
  detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);
  console.log("--------------------------------");

  // Main logging statement
  detailedLogger.importantSuccess(`Processing ${meta.importSource} stories...`);

  let data = {};
  switch (meta.importSource) {
    case "pivotal":
      data = await importPivotalStory({ team, options, meta });
      break;
    default:
      throw new Error(`Unknown import source: ${meta.importSource}`);
  }

  detailedLogger.result(`Data: ${JSON.stringify(data, null, 2)}`);

  await createUserMapping({
    team,
    teamId: team.id,
    teamName: team.name,
    pivotalUsers: data.pivotalUsers,
    foo: "bar",
  });

  await createLabels({ teamId: team.id, labels: DEFAULT_LABELS });
  await createStatusesForTeam({ teamId: team.id });

  return true;
}

// function initializeTeamData({ team, data }) {
//   await createLabels({ teamId, labels: LABELS_TO_CREATE });
//   await createStatusesForTeam({ teamId });
// }

export default importController;

// const response = {
//   status: "sucess",
//   body: "hey",
// };

// detailedLogger.success(`Response: ${JSON.stringify(response, null, 2)}`);

// return response;
