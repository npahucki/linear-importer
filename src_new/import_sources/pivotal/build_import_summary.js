import chalk from "chalk";

function buildImportSummary({ formattedIssuePayload, successfulImports }) {
  // Calculate type counts
  const typeCounts = formattedIssuePayload.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});

  const typeBreakdown = Object.entries(typeCounts)
    .map(([type, count]) => {
      const color =
        {
          chore: "white",
          bug: "red",
          feature: "yellow",
          epic: "magenta",
          release: "green",
        }[type] || "white";

      return `${type}: ${chalk[color].bold(count)}`;
    })
    .join("\n    ");

  const confirmProceedPrompt =
    chalk.blue.bold(`Import Summary:`) +
    chalk.white(`
    Already imported: ${chalk.green.bold(successfulImports.size)}

    ${typeBreakdown}
  
    Total Remaining Stories: ${chalk.green.bold(formattedIssuePayload.length)}`);

  return confirmProceedPrompt;
}

export default buildImportSummary;
