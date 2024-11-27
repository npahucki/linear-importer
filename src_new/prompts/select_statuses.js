import inquirer from "inquirer";
import fetchStatuses from "../statuses/list.mjs";

async function selectStatuses({ teamId }) {
  // Fetch existing statuses
  const existingStatuses = await fetchStatuses(teamId);
  const existingStatusNames = existingStatuses.map((status) => status.name);

  // Define the default statuses we want to create
  const defaultStatuses = [
    "pivotal - unscheduled",
    "pivotal - planned",
    "pivotal - started",
    "pivotal - accepted",
    "pivotal - finished",
  ];

  // Filter out statuses that already exist
  const statusesToCreate = defaultStatuses.filter(
    (status) => !existingStatusNames.includes(status),
  );

  if (statusesToCreate.length === 0) {
    return { selectedStatuses: [] };
  }

  const { selectedStatuses } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedStatuses",
      message:
        "Select the workflow statuses to create (unchecked statuses already exist):",
      choices: defaultStatuses.map((status) => ({
        name: status,
        value: status,
        checked: statusesToCreate.includes(status),
      })),
      validate: (answer) => true, // Allow any selection since existing statuses are already filtered
    },
  ]);

  return selectedStatuses;
}

export default selectStatuses;
