import chalk from 'chalk';
import inquirer from 'inquirer';
import { ENABLE_IMPORTING } from "../../config/config.js";

async function proceedWithImport({ pivotalStories, releaseStories, selectedStatusTypes, successfulImportsLength }) {
  const filteredReleaseStories = releaseStories.filter(story => 
    selectedStatusTypes.includes(story.type)
  );
  const filteredPivotalStories = pivotalStories.filter(story => 
    selectedStatusTypes.includes(story.type)
  );

  const typeBreakdown = selectedStatusTypes.map(type => {
    const pivotalCount = pivotalStories.filter(story => story.type === type).length;
    const releaseCount = releaseStories.filter(story => story.type === type).length;
    const totalCount = pivotalCount + releaseCount;
    const color = {
      chore: 'gray',
      bug: 'red',
      feature: 'yellow',
      epic: 'magenta', 
      release: 'green'
    }[type] || 'white';
    
    return `\n       ${type}: ${chalk[color].bold(totalCount)}`;
  }).join('');

  const confirmProceedPrompt = chalk.blue.bold(`
    📊 Import Summary:`) + chalk.white(`
       Already imported: ${chalk.green.bold(successfulImportsLength)}

      ${typeBreakdown}

      Total Remaining Stories: ${chalk.green.bold(filteredPivotalStories.length + filteredReleaseStories.length)}

    ${chalk.magenta.bold('Proceed with importing?')}`);
  
  if (!ENABLE_IMPORTING) {
    console.log(chalk.red.bold('\n╔═══════════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.red.bold('║                              IMPORTING DISABLED                           ║'));
    console.log(chalk.red.bold('╠═══════════════════════════════════════════════════════════════════════════╣'));
    console.log(chalk.red.bold('║  Set ENABLE_IMPORTING to true in the .env file to proceed with importing. ║'));
    console.log(chalk.red.bold('╚═══════════════════════════════════════════════════════════════════════════╝\n'));
    process.exit(1);
  }

  const { userConfirmedProceed } = await inquirer.prompt([
    {
      type: "list",
      name: "userConfirmedProceed",
      message: confirmProceedPrompt,
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      pageSize: 999,
      loop: false,
    },
  ]);
  
  return { userConfirmedProceed };
}

export default proceedWithImport;