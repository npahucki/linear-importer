import linearClient from "../../config/client.mjs";
import chalk from "chalk";
import { exitProcess } from "../../config/config.js";

async function createComment({ issueId, body }) {
  try {
    const response = await linearClient.createComment({
      issueId,
      body,
    });

    if (response.success) {
      // console.log(chalk.cyan("✅ Comment created"));
    } else {
      console.error(chalk.red("Error creating comment:"), response.errors);
      exitProcess();
    }
  } catch (error) {
    console.error(chalk.red("Error creating comment:"), error.message);
    exitProcess();
  }
}

export default createComment;
