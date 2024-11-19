import inquirer from 'inquirer';

async function selectStatusTypes(statusTypes) {
  const { selectedStatusTypes } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedStatusTypes',
      message: 'Which Pivotal Story Types would you like to include?',
      choices: statusTypes.map(status => ({
        name: status,
        value: status,
        checked: true
      })),
      validate: (answer) => {
        if (answer.length < 1) {
          return 'You must choose at least one status type.';
        }
        return true;
      }
    }
  ]);

  return { selectedStatusTypes };
}

export default selectStatusTypes;