import inquirer from "inquirer";
import teamsList from "./list.mjs";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function selectTeam() {
  if (!teamsList.length) {
    throw new Error("No teams found");
  }

  const teamChoices = teamsList
    .map((team) => ({
      name: team.name,
      value: team,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  detailedLogger.info(`${teamChoices.length} teams found`);

  const { selectedTeam } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedTeam",
      message: "Select a team:",
      choices: teamChoices,
      pageSize: 999,
      loop: false,
    },
  ]);

  // const team = buildTeam(selectedTeam);
  detailedLogger.info(`Selected team: ${JSON.stringify(selectedTeam)}`);

  return {
    id: selectedTeam.id,
    name: selectedTeam.name,
  };
}

export default selectTeam;
