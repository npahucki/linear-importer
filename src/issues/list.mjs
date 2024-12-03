import linearClient from "../../config/client.mjs";
async function fetchIssuesForTeam({ teamId, filters }) {
  // Construct the filter object
  const filter = {};
  if (teamId) filter.team = { id: { eq: teamId } };
  if (filters) Object.assign(filter, filters);

  // Query issues with the constructed filter
  const filteredIssues = await linearClient.issues({
    filter,
    // first: 100
  });

  let issues = [];

  if (filteredIssues.nodes.length) {
    filteredIssues.nodes.forEach((issue) => {
      // console.log("FULL issue", issue)
      const data = {
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        createdAt: issue.createdAt,
      };

      issues.push(data);
    });

    return issues;
  } else {
    console.log("No issues found matching the criteria");
  }
}

// fetchIssuesForTeam({ teamId: '9d138c4f-fe54-4692-b775-ac6413ecd727', labelId: 'a1940aec-35b4-43a4-b6ad-21c03b2559c2'})
export default fetchIssuesForTeam;

// import linearClient from "../../config/client.mjs";
// import chalk from "chalk";

// async function getMyIssues() {
//   const me = await linearClient.viewer;
//   console.log(chalk.green("me:", me.displayName));
//   console.log(chalk.yellow("Getting my issues..."));
//   const myIssues = await me.assignedIssues();

//   if (myIssues.nodes.length) {
//     myIssues.nodes.map((issue) =>
//       console.log(`${issue.identifier} - ${issue.title}`),
//     );
//   } else {
//     console.log(`${me.displayName} has no issues`);
//   }
// }

// getMyIssues();
