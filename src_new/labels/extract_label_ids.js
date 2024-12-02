import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function extractLabelIds(issue, teamLabels) {
  const typeColumnLabelId = teamLabels.find(
    (label) => label.name === `pivotal-${issue.type}`,
  )?.id;

  if (!typeColumnLabelId) {
    detailedLogger.error(`No label found from 'Type' column for ${issue.type}`);
    process.exit(0);
  }

  detailedLogger.info(
    `Label found from 'Type' column: ${issue.type} => ${typeColumnLabelId}`,
  );

  const otherLabelIds = issue.labels
    ? issue.labels
        .split(",")
        .map((label) => label.trim())
        .map(
          (label) =>
            teamLabels.find((teamLabel) => teamLabel.name === label)?.id,
        )
        .filter((id) => id)
    : [];
  const labelIds = [typeColumnLabelId, ...otherLabelIds].filter(Boolean);

  return labelIds;
}

export default extractLabelIds;
