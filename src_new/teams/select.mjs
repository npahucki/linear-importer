import inquirer from "inquirer";
import teamsList from "./list.mjs";

import fetchLabels from "../labels/list.mjs";
import fetchEstimatesForTeam from "../estimates/list.mjs";

import DetailedLogger from "../../logger/detailed_logger.mjs";

async function selectTeam() {
  const detailedLogger = new DetailedLogger();

  if (!teamsList.length) {
    throw new Error("No teams found");
  }

  const teamChoices = teamsList.map((team) => ({
    name: team.name,
    value: team,
  }));

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

  const team = buildTeam(selectedTeam);

  return team;
}

async function buildTeam(selectedTeam) {
  const detailedLogger = new DetailedLogger();
  const labels = await fetchLabels({ teamId: selectedTeam.id });
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: selectedTeam.id,
  });

  const params = {
    id: selectedTeam.id,
    name: selectedTeam.name,
    labels,
    issueEstimation,
  };

  detailedLogger.info(`Selected team: ${JSON.stringify(params)}`);

  return params;
}

export default selectTeam;
