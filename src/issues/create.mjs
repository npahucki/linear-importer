import linearClient from "../../config/client.mjs";
import chalk from "chalk";
import createComment from "../comments/create.mjs";

import { promises as fs } from "fs";

import findAttachmentsInFolder from "../files/find_attachments_in_folder.mjs";
import upload from "../files/upload.mjs";

import { ENABLE_DETAILED_LOGGING } from "../../config/config.js";
import { exitProcess } from "../../config/config.js";

import path from "path";

async function getUserMapping(teamName) {
  try {
    // Move up one directory from 'src' to the project root
    const projectRoot = path.join(process.cwd(), "..");
    const mappingPath = path.join(
      projectRoot,
      "log",
      teamName,
      "user_mapping.json",
    );

    if (ENABLE_DETAILED_LOGGING) {
      console.log("Looking for mapping file at:", mappingPath);
    }

    const mappingFile = await fs.readFile(mappingPath, "utf8");
    const mappingData = JSON.parse(mappingFile);
    return mappingData.mapping;
  } catch (error) {
    console.warn(
      chalk.yellow(
        `Warning: Could not load user mapping file: ${error.message}`,
      ),
    );
    return {};
  }
}

async function createIssue({
  teamId,
  teamName,
  pivotalStory,
  importNumber,
  parentId,
  stateId,
  csvFilename,
  importFiles,
  labelIds,
}) {
  try {
    const userMapping = await getUserMapping(teamName);

    // Get assigneeId and subscriberIds from mapping if they exist
    let assigneeId;
    const subscriberIds = [];

    // Add creator as subscriber if they have a mapping
    if (pivotalStory.requestedBy) {
      const mappedRequester = userMapping[pivotalStory.requestedBy];
      if (mappedRequester?.linearId && !subscriberIds.includes(mappedRequester.linearId)) {
        subscriberIds.push(mappedRequester.linearId);
        if (ENABLE_DETAILED_LOGGING) {
          console.log(
            chalk.blue(
              `Added creator "${pivotalStory.requestedBy}" to subscribers`,
            ),
          );
        }
      }
    }

    if (pivotalStory.ownedBy) {
      // Ensure ownedBy is a string and split by comma
      const ownedByString = String(pivotalStory.ownedBy);
      const owners = ownedByString.split(",").map((owner) => owner.trim());

      // Find all owners that have a mapping
      for (const owner of owners) {
        const mappedUser = userMapping[owner];
        if (mappedUser?.linearId) {
          // First valid user becomes assignee
          if (!assigneeId) {
            assigneeId = mappedUser.linearId;
            if (ENABLE_DETAILED_LOGGING) {
              console.log(
                chalk.blue(
                  `Mapped Pivotal user "${owner}" to Linear ID: ${assigneeId} as assignee`,
                ),
              );
            }
          }
          // Add all valid users as subscribers
          if (!subscriberIds.includes(mappedUser.linearId)) {
            subscriberIds.push(mappedUser.linearId);
            if (ENABLE_DETAILED_LOGGING) {
              console.log(
                chalk.blue(
                  `Added Pivotal user "${owner}" to subscribers`,
                ),
              );
            }
          }
        }
      }

      if (!assigneeId && ENABLE_DETAILED_LOGGING) {
        console.log(
          chalk.yellow(
            `No Linear user mapping found for any Pivotal users: ${owners.join(
              ", ",
            )}`,
          ),
        );
      }
    }

    // If no owner was found, try to use the requestedBy user as the assignee
    if (!assigneeId && pivotalStory.requestedBy) {
      const mappedRequester = userMapping[pivotalStory.requestedBy];
      if (mappedRequester?.linearId) {
        assigneeId = mappedRequester.linearId;
        if (ENABLE_DETAILED_LOGGING) {
          console.log(
            chalk.blue(
              `No owner found. Mapped requester "${pivotalStory.requestedBy}" to Linear ID: ${assigneeId}`,
            ),
          );
        }
      }
    }

    const newIssue = await linearClient.createIssue({
      teamId,
      labelIds,
      title: pivotalStory.name,
      description: pivotalStory.description,
      stateId: stateId ? stateId : undefined,
      parentId: parentId ? parentId : undefined,
      dueDate: pivotalStory.dueDate
        ? new Date(pivotalStory.dueDate).toISOString()
        : undefined,
      createdAt: pivotalStory.createdAt
        ? new Date(pivotalStory.createdAt).toISOString()
        : undefined,
      priority: formatPriority(pivotalStory.priority),
      assigneeId,
      subscriberIds,
      cycleId: null,
      // estimate: [0, 1, 2, 4, 8, 16][Math.floor(Math.random() * 6)]
    });

    if (newIssue.success) {
      const issueId = newIssue._issue.id;
      console.log(
        chalk.green(
          `✅ ${importNumber} - Linear Issue ${issueId} created from Pivotal story ${
            pivotalStory.id
          } - ${chalk.magenta(pivotalStory.name)}`,
        ),
      );

      // Create comments
      if (pivotalStory.comments.length > 0) {
        await Promise.all(
          pivotalStory.comments.map(async (body) => {
            try {
              await createComment({ issueId, body });
            } catch (error) {
              console.error(
                chalk.red(
                  `${importNumber} - Error creating comment: ${error.message}`,
                ),
              );
              exitProcess();
            }
          }),
        );
        console.log(
          chalk.yellow(
            `✅ (${pivotalStory.comments.length}) comment(s) created.`,
          ),
        );
      }

      if (importFiles) {
        // Attachments
        const attachments = await findAttachmentsInFolder({
          csvFilename,
          pivotalStoryId: pivotalStory.id,
        });

        if (ENABLE_DETAILED_LOGGING)
          console.log(`Attachments for story ${pivotalStory.id}:`, attachments);

        if (attachments.length > 0) {
          for (const attachment of attachments) {
            try {
              await upload(attachment, issueId);
              console.log(
                chalk.yellow(`✅ Attachment uploaded: ${attachment}`),
              );
            } catch (error) {
              console.error(
                chalk.red(
                  `Error uploading attachment ${attachment}: ${error.message}`,
                ),
              );
              exitProcess();
            }
          }
        } else {
          if (ENABLE_DETAILED_LOGGING)
            console.log(
              chalk.yellow(`No attachments found for story ${pivotalStory.id}`),
            );
        }
      }
    } else {
      console.error(
        chalk.red(`${importNumber} - Error creating issue:`, error.message),
      );
      exitProcess();
    }
  } catch (error) {
    console.error(
      chalk.red(`${importNumber} - Error creating issue:`, error.message),
    );
    exitProcess();
  }
}

function formatPriority(pivotalStoryPriority) {
  const pivotalPriorities = {
    "p1 - High": 2,
    "p2 - Medium": 3,
    "p3 - Low": 4,
  };

  return pivotalPriorities[pivotalStoryPriority] || 4;
}

export default createIssue;