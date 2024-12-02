import DetailedLogger from "../../logger/detailed_logger.mjs";
import roundEstimate from "../estimates/rounder.mjs";
import formatPriority from "../priority/formatter.js";
import extractLabelIds from "../labels/extract_label_ids.js";
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
  releaseIssues,
}) {
  const stateId = teamStatuses.find(
    (state) => state.name === `${importSource} - ${issue.state}`,
  )?.id;
  const labelIds = extractLabelIds(issue, teamLabels);
  const priority = issue.priority ? formatPriority(issue.priority) : undefined;
  const estimate = issue.estimate
    ? roundEstimate(issue.estimate, scale)
    : undefined;
  const dueDate = formatDate(issue.dueDate);
  const createdAt = formatDate(issue.createdAt);
  const { assigneeId, subscriberIds } = await userDistributor(issue, team.name);
  const parentId = releaseIssues?.find((release) =>
    release.title.includes(`[${issue.iteration}]`),
  )?.id;

  const issueParams = {
    cycleId: null,
    teamId: team.id,
    title: issue.title,
    description: issue.description,
    labelIds: options.shouldImportLabels ? labelIds : undefined,
    estimate: options.shouldImportEstimates ? estimate : undefined,
    priority: options.shouldImportPriority ? priority : undefined,
    assigneeId,
    subscriberIds,
    parentId,
    stateId,
    dueDate,
    createdAt,
  };

  detailedLogger.importantInfo(
    `Original Issue ID: ${issue.id}
     issueParams: ${JSON.stringify(issueParams, null, 2)}`,
  );

  return issueParams;
}

export default buildIssueParams;
