import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function formatLabels(labels, teamLabels) {
  const pivotalStoryTypeLabelId = teamLabels.find(
    (label) => label.name === `pivotal - ${labels.type}`,
  )?.id;

  if (!pivotalStoryTypeLabelId) {
    detailedLogger.warn(`No pivotal story type label found for ${labels.type}`);
  }

  const otherLabelIds = labels
    ? labels
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
