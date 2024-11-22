import inquirer from 'inquirer';

async function importPivotalEstimates() {
  const { importEstimates } = await inquirer.prompt([
    {
      type: 'list',
      name: 'importEstimates',
      message: 'Do you want to import Estimates?',
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      default: true,
    },
  ]);

  return importEstimates;
}

export default importPivotalEstimates;