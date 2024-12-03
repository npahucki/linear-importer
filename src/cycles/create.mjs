import linearClient from "../../config/client.mjs";
import chalk from "chalk";

async function createCycle({ team, releaseStory, importNumber }) {  
  try {
    const response = await linearClient.createCycle({
      teamId: team.id,
      name: releaseStory.name,
      startsAt: releaseStory.startsAt,
      endsAt: releaseStory.endsAt,
    });

    if (response.success) {
      console.log(chalk.cyan(`✅ ${importNumber} Cycle "${cycle.name}" created`));
    } else {
      console.error(chalk.red(`Error creating cycle "${cycle.name}":`, response.errors));
    }
  } catch (error) {
    console.error(chalk.red("Error creating cycles:"), error.message);
  }
}

export default createCycle;