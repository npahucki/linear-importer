import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function buildParams({
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

  const params = {
    teamId: team.id,
    stateId,
    title: issue.title,
    description: issue.description,
    labelIds: options.shouldImportLabels ? labelIds : undefined,
    estimate: options.shouldImportEstimates ? estimate : undefined,
    priority: options.shouldFormatPriority ? priority : undefined,
    // parentId,
    // dueDate,
    // createdAt,
    // assigneeId,
    // subscriberIds,
    cycleId: null,
  };

  detailedLogger.importantInfo(
    `Issue Params: ${JSON.stringify(params, null, 2)}`,
  );

  return params;
}

export default buildParams;
