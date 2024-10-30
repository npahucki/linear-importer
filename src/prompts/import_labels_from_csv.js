import inquirer from 'inquirer';

async function importLabelsFromCSV() {
  const { importLabels } = await inquirer.prompt([
    {
      type: 'list',
      name: 'importLabels',
      message: 'Do you want to import labels?',
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      default: true,
    },
  ]);

  return { importLabels };
}

export default importLabelsFromCSV;