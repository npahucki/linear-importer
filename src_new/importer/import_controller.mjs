import DetailedLogger from "../../logger/detailed_logger.mjs";

import importPivotalStory from "./pivotal.mjs";

const detailedLogger = new DetailedLogger();

// importTypeDataProcessor
async function importController({ team, options, meta }) {
  detailedLogger.info(`🔸 Starting import for team ${team.name}`);
  detailedLogger.loading(`Import Source: ${meta.importSource}`);
  console.log("--------------------------------");
  detailedLogger.warning(`Team: ${JSON.stringify(team, null, 2)}`);
  detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
  detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);
  console.log("--------------------------------");
  detailedLogger.importantSuccess(`Processing ${meta.importSource} stories...`);

  let data = {};
  switch (meta.importSource) {
    case "pivotal":
      data = await importPivotalStory({ team, options, meta });

      detailedLogger.result(`Data: ${JSON.stringify(data, null, 2)}`);
      break;
    default:
      throw new Error(`Unknown import source: ${meta.importSource}`);
  }

  // {
  //   team,
  //   options,
  //   meta
  // }

  return data;
}

export default importController;
