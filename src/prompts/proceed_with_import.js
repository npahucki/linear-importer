import chalk from 'chalk';
import inquirer from 'inquirer';
import { ENABLE_IMPORTING } from "../../config/config.js";


async function proceedWithImport({ pivotalStories, releaseStories }) {
  const confirmProceedPrompt = chalk.blue.bold(`
    📊 Import Summary:`) + chalk.white(`
       Total Stories: ${chalk.yellow.bold(pivotalStories.length + releaseStories.length)}
       Releases: ${chalk.green(releaseStories.length)}
       All Others: ${chalk.cyan(pivotalStories.length)}
    
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