import inquirer from "inquirer";
import teamsList from "./list.mjs";

import fetchEstimatesForTeam from "../estimates/list.mjs";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

async function selectTeam() {
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
  // Adding issue estimation to the team object to be used for the `shouldImportEstimates` prompt
  // We'll fetch this value again in `create_issues.js` immediately before creating issues to ensure the correct estimate type is used,
  // because it's possible that the user changed the value in `update_issue_estimation_type.js`
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: selectedTeam.id,
  });

  const params = {
    id: selectedTeam.id,
    name: selectedTeam.name,
    issueEstimation,
  };

  detailedLogger.info(`Selected team: ${JSON.stringify(params)}`);

  return params;
}

export default selectTeam;
