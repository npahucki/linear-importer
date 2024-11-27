import DetailedLogger from "../../logger/detailed_logger.mjs";
import roundEstimate from "../estimates/rounder.mjs";
import formatPriority from "../priority/formatter.js";
import formatLabels from "../labels/formatter.js";
import userDistributor from "../users/distributor.js";

const detailedLogger = new DetailedLogger();

const formatDate = (date) => (date ? new Date(date).toISOString() : undefined);

async function buildIssueParams({
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
  const { assigneeId, subscriberIds } = await userDistributor(issue, team.name);

  const issueParams = {
    teamId: team.id,
    stateId,
    dueDate,
    createdAt,
    title: issue.title,
    description: issue.description,
    labelIds: options.shouldImportLabels ? labelIds : undefined,
    estimate: options.shouldImportEstimates ? estimate : undefined,
    priority: options.shouldImportPriority ? priority : undefined,
    assigneeId,
    subscriberIds,
    cycleId: null,
    // parentId,
  };

  detailedLogger.importantInfo(
    `issueParams: ${JSON.stringify(issueParams, null, 2)}`,
  );

  return issueParams;
}

export default buildIssueParams;
