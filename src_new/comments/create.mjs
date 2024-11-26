import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createComment({ issueId, body }) {
  try {
    const response = await linearClient.createComment({
      issueId,
      body,
    });

    if (response.success) {
      return response._comment;
    } else {
      console.error(chalk.red("Error creating comment:"), response.errors);
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("Error creating comment:"), error.message);
    process.exit(1);
  }
}

export default createComment;
