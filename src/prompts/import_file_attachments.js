import inquirer from 'inquirer';

async function importFileAttachments() {
  const { importFiles } = await inquirer.prompt([
    {
      type: 'list',
      name: 'importFiles',
      message: 'Do you want to import file attachments?',
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      default: true,
    },
  ]);

  return { importFiles };
}

export default importFileAttachments;