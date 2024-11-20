import linearClient from "../../config/client.mjs";
import chalk from "chalk";
import createComment from "../comments/create.mjs";

import findAttachmentsInFolder from "../files/find_attachments_in_folder.mjs";
import upload from '../files/upload.mjs';

import { ENABLE_DETAILED_LOGGING } from "../../config/config.js";
import { exitProcess } from "../../config/config.js";

async function createIssue({
  teamId,
  pivotalStory,
  importNumber,
  parentId,
  stateId,
  csvFilename, 
  importFiles,
  labelIds,
  assigneeId
}) {
  try {
    const newIssue = await linearClient.createIssue({
      teamId,
      labelIds,
      title: pivotalStory.name,
      description: pivotalStory.description,
      stateId: stateId ? stateId : undefined,
      parentId: parentId ? parentId : undefined,
      dueDate: pivotalStory.dueDate ? new Date(pivotalStory.dueDate).toISOString() : undefined,
      createdAt: pivotalStory.createdAt ? new Date(pivotalStory.createdAt).toISOString() : undefined,
      priority: formatPriority(pivotalStory.priority),
      assigneeId
      // estimate: [0, 1, 2, 4, 8, 16][Math.floor(Math.random() * 6)]
    });

    if (newIssue.success) {
      const issueId = newIssue._issue.id;
      console.log(chalk.green(`✅ ${importNumber} - Linear Issue ${issueId} created from Pivotal Story ${pivotalStory.id} - ${chalk.magenta(pivotalStory.name)}`));

      // Create comments
      if (pivotalStory.comments.length > 0) {
        await Promise.all(
          pivotalStory.comments.map(async (body) => {
            try {
              await createComment({ issueId, body });
            } catch (error) {
              console.error(chalk.red(`${importNumber} - Error creating comment: ${error.message}`));
              exitProcess();
            }
          }),
        );
        console.log(chalk.yellow(`✅ (${pivotalStory.comments.length}) comment(s) created.`));
      }

      if (importFiles) {
        // Attachments
        const attachments = await findAttachmentsInFolder({ csvFilename, pivotalStoryId: pivotalStory.id })

        if (ENABLE_DETAILED_LOGGING) console.log(`Attachments for story ${pivotalStory.id}:`, attachments);

        if (attachments.length > 0) {
          for (const attachment of attachments) {
            try {
              await upload(attachment, issueId);
              console.log(chalk.yellow(`✅ Attachment uploaded: ${attachment}`));
            } catch (error) {
              console.error(chalk.red(`Error uploading attachment ${attachment}: ${error.message}`));
              exitProcess();
            }
          }
        } else {
          if (ENABLE_DETAILED_LOGGING) console.log(chalk.yellow(`No attachments found for story ${pivotalStory.id}`));
        }
      }
    } else {
      console.error(chalk.red(`${importNumber} - Error creating issue:`, error.message));
      exitProcess();
    }
  } catch (error) {
    console.error(chalk.red(`${importNumber} - Error creating issue:`, error.message));
    exitProcess();
  }
}

function formatPriority(pivotalStoryPriority) {
  const pivotalPriorities = {
    'p3 - Low': 4,
    'p2 - Medium': 3,
    'p1 - High': 2,
  }

  return pivotalPriorities[pivotalStoryPriority] || 2
}

export default createIssue;
