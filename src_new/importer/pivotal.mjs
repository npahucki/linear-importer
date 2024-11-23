import DetailedLogger from "../../logger/detailed_logger.mjs";

import parseCSV from "../csv/parse_new.mjs";
import selectStatusTypes from "../prompts/select_status_types.js";

const detailedLogger = new DetailedLogger();

async function pivotal({ team, options, meta }) {
  detailedLogger.importantInfo(`Importing Pivotal story`);

  // detailedLogger.info(`🔸 Starting import for team ${team.name}`);
  // detailedLogger.loading(`Import Source: ${meta.importSource}`);
  console.log("--------------------------------");
  detailedLogger.warning(`Team: ${JSON.stringify(team, null, 2)}`);
  detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
  detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);
  console.log("--------------------------------");
  detailedLogger.importantSuccess(`Processing ${meta.importSource} stories...`);

  // const {
  //   releaseStories,
  //   pivotalStories,
  //   statusTypes,
  //   labels,
  //   csvFilename,
  //   pivotalUsers,
  // } = await parseCSV();

  // Parse CSV
  const csvData = await parseCSV(meta.directory);

  // detailedLogger.info(`CSV Data: ${JSON.stringify(csvData, null, 2)}`);

  const { selectedStatusTypes } = await selectStatusTypes(csvData.statusTypes);

  // if (newReleaseStories.length + newPivotalStories.length === 0) {
  //   console.log(chalk.bold.green("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  //   console.log(chalk.bold.green("✨ All stories already imported! ✨"));
  //   console.log(chalk.bold.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  //   process.exit(0);
  // }

  detailedLogger.info(`Selected Status Types: ${selectedStatusTypes}`);

  return { csvData, selectedStatusTypes };
}

export default pivotal;

// console.log("\nImport Status:");
//   console.log("Successful imports from CSV:", successfulImports.size);
//   console.log(
//     "Sample of successful imports:",
//     Array.from(successfulImports).slice(0, 5),
//   );
//   console.log("\nPivotal Stories:");
//   console.log("Total stories from Pivotal (raw):", pivotalStories.length);
//   console.log(
//     "Total unique stories from Pivotal:",
//     uniquePivotalStories.length,
//   );
//   console.log(
//     "Sample of unique Pivotal story IDs:",
//     uniquePivotalStories.slice(0, 5).map((story) => story.id),
//   );
