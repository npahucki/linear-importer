import inquirer from "inquirer";
import teamsList from "./list.mjs";

async function selectTeam() {
  const teamChoices = teamsList.map((team) => ({
    name: team.name,
    value: team
  }));

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

  return {
    teamId: selectedTeam.id,
    teamName: selectedTeam.name,
  };
}

export default selectTeam;