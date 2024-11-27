import getUserMapping from "./get_user_mapping.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

/**
 * @typedef {Object} Issue
 * @property {string} [requestedBy] - The user who requested/created the issue
 * @property {string|string[]} [ownedBy] - The user(s) who own the issue (can be comma-separated string)
 */

/**
 * @typedef {Object} DistributionResult
 * @property {string} [assigneeId] - The Linear user ID of the assigned user
 * @property {string[]} subscriberIds - Array of Linear user IDs for subscribers
 */

/**
 * Distributes users from a Pivotal issue to Linear user assignments.
 * Maps Pivotal users to Linear users based on the following rules:
 * 1. The first valid owner becomes the assignee
 * 2. All valid owners become subscribers
 * 3. The creator becomes a subscriber if they have a valid mapping
 * 4. If no valid owner is found, the creator becomes the assignee
 *
 * @param {Issue} issue - The Pivotal issue containing user information
 * @param {string} teamName - The team name used to lookup user mappings
 * @returns {Promise<DistributionResult>} Object containing assignee and subscriber IDs
 */
async function distributeUsers(issue, teamName) {
  const userMapping = await getUserMapping(teamName);

  // Get assigneeId and subscriberIds from mapping if they exist
  let assigneeId;
  const subscriberIds = [];

  // Add creator as subscriber if they have a mapping
  if (issue.requestedBy) {
    const mappedRequester = userMapping[issue.requestedBy];
    if (
      mappedRequester?.linearId &&
      !subscriberIds.includes(mappedRequester.linearId)
    ) {
      subscriberIds.push(mappedRequester.linearId);
      detailedLogger.info(
        `Added creator "${issue.requestedBy}" to subscribers`,
      );
    }
  }

  if (issue.ownedBy) {
    // Ensure ownedBy is a string and split by comma
    const ownedByString = String(issue.ownedBy);
    const owners = ownedByString.split(",").map((owner) => owner.trim());

    // Find all owners that have a mapping
    for (const owner of owners) {
      const mappedUser = userMapping[owner];
      if (mappedUser?.linearId) {
        // First valid user becomes assignee
        if (!assigneeId) {
          assigneeId = mappedUser.linearId;
          detailedLogger.info(
            `Mapped Pivotal user "${owner}" to Linear ID: ${assigneeId} as assignee`,
          );
        }
        // Add all valid users as subscribers
        if (!subscriberIds.includes(mappedUser.linearId)) {
          subscriberIds.push(mappedUser.linearId);
          detailedLogger.info(`Added Pivotal user "${owner}" to subscribers`);
        }
      }
    }

    if (!assigneeId) {
      detailedLogger.info(
        `No Linear user mapping found for any Pivotal users: ${owners.join(
          ", ",
        )}`,
      );
    }
  }

  // If no owner was found, try to use the requestedBy user as the assignee
  if (!assigneeId && issue.requestedBy) {
    const mappedRequester = userMapping[issue.requestedBy];
    if (mappedRequester?.linearId) {
      assigneeId = mappedRequester.linearId;
      detailedLogger.info(
        `No owner found. Mapped requester "${issue.requestedBy}" to Linear ID: ${assigneeId}`,
      );
    }
  }

  const data = { assigneeId, subscriberIds };

  detailedLogger.result(`distributeUsers: ${JSON.stringify(data, null, 2)}`);

  return data;
}

export default distributeUsers;
