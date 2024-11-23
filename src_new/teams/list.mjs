import linearClient from "../../config/client.mjs";

const teams = await linearClient.teams();

const teamsList = teams.nodes.map((team) => {
  return {
    name: team.name,
    id: team.id,
  };
});

export default teamsList;
