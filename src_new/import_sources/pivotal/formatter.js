import DetailedLogger from "../../../logger/detailed_logger.mjs";
import readSuccessfulImports from "../../../logger/read_successful_imports_new.mjs";

import parseCSV from "../../csv/parse_new.mjs";
import selectStatusTypes from "./select_status_types.js";

import buildImportSummary from "./build_import_summary.js";

const detailedLogger = new DetailedLogger();

async function formatter({ team, meta }) {
  detailedLogger.importantLoading(`Setting up Pivotal Import...`);

  // Prompt user to select status types
  const selectedStatusTypes = await selectStatusTypes();

  // Parse CSV
  const csvData = await parseCSV(meta.directory);

  // Read previously imported stories from `successful_imports.csv`
  const successfulImports = await readSuccessfulImports(team.name);

  // Filter out stories that have already been imported and logged in `successful_imports.csv`
  // TODO: move this out of pivotal formatter and make it a global function. probably need to create a dir for each import source to allow for different log files per import source
  const pivotalStoriesThatHaveNotBeenImported = csvData.issues.filter(
    // (story) => !successfulImports.has(story.id),
    (story) => true,
  );

  // Only include stories that match the selected status types in `selectedStatusTypes`
  const formattedIssuePayload = pivotalStoriesThatHaveNotBeenImported.filter(
    (story) => selectedStatusTypes.includes(story.state),
  );

  // TODO: Make this shorter... maybe return a sample object or set to a different logging level
  detailedLogger.info(
    `Formatted Issue Payload: ${JSON.stringify(
      formattedIssuePayload,
      null,
      2,
    )}`,
  );

  // Check if there are any stories left to import
  if (formattedIssuePayload.length === 0) {
    detailedLogger.importantSuccess(
      "You have already imported all Pivotal Stories! Exiting.",
    );
    process.exit(0);
  }

  // Build import summary
  const confirmationMessage = buildImportSummary(formattedIssuePayload);

  return { csvData, confirmationMessage };
}

// function displayConfirmProceedPrompt(formattedIssuePayload) {
//   const typeBreakdown = formattedIssuePayload
//     .map((issue) => {
//       const color =
//         {
//           chore: "white",
//           bug: "red",
//           feature: "yellow",
//           epic: "magenta",
//           release: "green",
//         }[issue.type] || "white";

//       return `\n       ${issue.type}: ${chalk[color].bold(formattedIssuePayload.count)}`;
//     })
//     .join("");

//   const confirmProceedPrompt =
//     chalk.blue.bold(`
//   📊 Import Summary:`) +
//     chalk.white(`
//      Already imported: ${chalk.green.bold("successfulImportsLength - TODO")}
//     ${typeBreakdown}

//     Total Remaining Stories: ${chalk.green.bold("TODO successfulImportsLength - issues.count")}`);

//   return confirmProceedPrompt;
// }

export default formatter;

// if (newReleaseStories.length + newPivotalStories.length === 0) {
//   console.log(chalk.bold.green("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
//   console.log(chalk.bold.green("✨ All stories already imported! ✨"));
//   console.log(chalk.bold.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
//   process.exit(0);
// }

// detailedLogger.info(`🔸 Starting import for team ${team.name}`);
// detailedLogger.loading(`Import Source: ${meta.importSource}`);
// console.log("--------------------------------");
// detailedLogger.warning(`Team: ${JSON.stringify(team, null, 2)}`);
// detailedLogger.success(`Options: ${JSON.stringify(options, null, 2)}`);
// detailedLogger.info(`Meta: ${JSON.stringify(meta, null, 2)}`);
// console.log("--------------------------------");
// detailedLogger.importantSuccess(`Processing ${meta.importSource} stories...`);

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
