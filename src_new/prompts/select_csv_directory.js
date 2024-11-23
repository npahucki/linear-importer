import inquirer from "inquirer";

async function selectDirectory(directories) {
  const { selectedDirectory } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedDirectory",
      message: "Select a directory:",
      choices: directories,
    },
  ]);
  return selectedDirectory;
}

export default selectDirectory;
