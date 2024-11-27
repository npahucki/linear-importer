import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function formatLabels(issue, teamLabels) {
  const pivotalStoryTypeLabelId = teamLabels.find(
    (label) => label.name === `pivotal - ${issue.type}`,
  )?.id;

  if (!pivotalStoryTypeLabelId) {
    detailedLogger.warning(
      `No pivotal story type label found for ${issue.type}`,
    );
  }

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
  const labelIds = [pivotalStoryTypeLabelId, ...otherLabelIds].filter(Boolean);

  return labelIds;
}

export default formatLabels;
