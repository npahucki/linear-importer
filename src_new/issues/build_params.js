import DetailedLogger from "../../logger/detailed_logger.mjs";
import roundEstimate from "../estimates/rounder.mjs";
import formatPriority from "../priority/formatter.js";
import formatLabels from "../labels/formatter.js";

const detailedLogger = new DetailedLogger();

const formatDate = (date) => (date ? new Date(date).toISOString() : undefined);

function buildParams({
  team,
  issue,
  options,
  importSource,
  teamStatuses,
  teamLabels,
  scale,
}) {
  const stateId = teamStatuses.find(
    (state) => state.name === `${importSource} - ${issue.state}`,
  )?.id;

  const estimate = issue.estimate
    ? roundEstimate(issue.estimate, scale)
    : undefined;
  const priority = issue.priority ? formatPriority(issue.priority) : undefined;
  const dueDate = formatDate(issue.dueDate);
  const createdAt = formatDate(issue.createdAt);
  const labelIds = formatLabels(issue, teamLabels);

  const params = {
    teamId: team.id,
    stateId,
    dueDate,
    createdAt,
    title: issue.title,
    description: issue.description,
    labelIds: options.shouldImportLabels ? labelIds : undefined,
    estimate: options.shouldImportEstimates ? estimate : undefined,
    priority: options.shouldFormatPriority ? priority : undefined,
    // parentId,
    // assigneeId,
    // subscriberIds,
    cycleId: null,
  };

  detailedLogger.importantInfo(
    `buildParams: ${JSON.stringify(params, null, 2)}`,
  );

  return params;
}

export default buildParams;
