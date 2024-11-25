import DetailedLogger from "../../../logger/detailed_logger.mjs";

import parseCSV from "../../csv/parse_new.mjs";
import selectStatusTypes from "./select_status_types.js";

import buildImportSummary from "./build_import_summary.js";
import readSuccessfulImports from "../../../logger/read_successful_imports_new.mjs";

const detailedLogger = new DetailedLogger();

async function formatter({ directory, team }) {
  detailedLogger.importantLoading(`Beginning Pivotal import...`);

  // Prompt user to select status types
  const selectedStatusTypes = await selectStatusTypes();

  // Parse CSV
  const csvData = await parseCSV(directory);

  const successfulImports = await readSuccessfulImports({ team });

  // Only include stories that match the selected status types
  const formattedIssuePayload = csvData.issues.filter((story) =>
    selectedStatusTypes.includes(story.state),
  );

  detailedLogger.info(
    `Formatted Issue Payload: ${JSON.stringify(
      formattedIssuePayload,
      null,
      2,
    )}`,
  );

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
