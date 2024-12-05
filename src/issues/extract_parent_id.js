import { detailedLogger } from "../../logger/logger_instance.js";

function extractParentId(issue, releaseIssues) {
  const matchingReleases =
    releaseIssues?.filter((release) => {
      return release.title.includes(`[Release ${issue.iteration}]`);
    }) || [];

  if (matchingReleases.length > 1) {
    detailedLogger.warning(
      `Multiple release issues found for iteration [Release ${issue.iteration}]. Using first match. Matches: ${matchingReleases
        .map((r) => r.title)
        .join(", ")}`,
    );
  }

  const parentId = matchingReleases[0]?.id || undefined;

  return parentId;
}

export default extractParentId;
