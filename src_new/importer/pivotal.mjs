import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function importPivotalStory(data, team, options, meta) {
  detailedLogger.info(`Importing Pivotal story`);
}

export default importPivotalStory;
