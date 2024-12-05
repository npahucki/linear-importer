import { detailedLogger } from "../../logger/logger_instance.js";

function extractLabelIds(issue, teamLabels, importSource) {
  // Create a Map for O(1) label lookups
  const labelMap = new Map(teamLabels.map((label) => [label.name, label.id]));

  // Single lookup for type label
  const typeColumnLabelName = `${importSource}-${issue.type}`;
  const typeColumnLabelId = labelMap.get(typeColumnLabelName);

  // This should always be present. If it's not, something is wrong and we should halt
  if (!typeColumnLabelId) {
    detailedLogger.error(
      `No label found from 'Type' column for ${issue.type}, ${issue.type.length}`,
    );

    console.log(
      "issue.type.trim()",
      issue.type.trim(),
      issue.type.trim().length,
    );

    process.exit(0);
  }

  // Process other labels more efficiently
  const otherLabelIds = issue.labels
    ? issue.labels.split(",").reduce((ids, label) => {
        const id = labelMap.get(label.trim());
        if (id) ids.push(id);
        return ids;
      }, [])
    : [];

  return [typeColumnLabelId, ...otherLabelIds].filter(Boolean);
}

export default extractLabelIds;
