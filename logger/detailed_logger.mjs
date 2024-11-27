import { ENABLE_DETAILED_LOGGING, LOGGING_LEVEL } from "../config/config.js";
import chalk from "chalk";

class DetailedLogger {
  constructor(prefix = "") {
    this.prefix = prefix;
  }

  info(message) {
    if (ENABLE_DETAILED_LOGGING === false) return;
    console.log(chalk.dim.yellowBright(`🔸 ${message}`));
  }

  loading(message) {
    if (LOGGING_LEVEL < 1) return;
    console.log(chalk.dim.yellowBright(`⏳ ${message}...`));
  }

  success(message) {
    if (LOGGING_LEVEL < 1) return;
    console.log(chalk.green(`✅ ${message}`));
  }

  warning(message) {
    if (LOGGING_LEVEL < 1) return;
    console.warn(chalk.yellow(`⚠️ ${message}`));
  }

  result(message) {
    if (LOGGING_LEVEL < 1) return;
    console.log(chalk.green(`📊 ${message}`));
  }

  created(attribute, message) {
    console.log(
      `✅ ${chalk.green(`${attribute} created`)}: ${chalk.magenta(message)}`,
    );
  }

  createdSecondary(attribute, id, message = "") {
    console.log(
      `✅ ${chalk.yellow(`${attribute} created`)}: ${chalk.cyan(id)} - ${chalk.dim(message.slice(0, 20))}...`,
    );
  }

  error(message) {
    console.error(chalk.red(`❌ ${message}`));
  }

  importantInfo(message) {
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  ✨ ${message}`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantLoading(message) {
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  ⏳ ${message}...`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantSuccess(message) {
    console.log("\n" + chalk.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.green(`  ✨ ${message}`));
    console.log(chalk.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }

  importantError(message) {
    console.error("\n" + chalk.red("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓"));
    console.error(chalk.bold.red(`  ⚠️  ${message}`));
    console.error(chalk.red("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n"));
  }

  importantSummary(message) {
    console.log("\n" + chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.bold.cyan(`  📊 ${message}`));
    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
  }
}

export default DetailedLogger;

// Example Usage:
/*
import Logger from './detailed_logger.mjs';

// Create a logger instance with a prefix
const apiLogger = new Logger('API');
apiLogger.info('Server started on port 3000');    // [2024-03-20T15:30:45.123Z] [API] Server started on port 3000
apiLogger.warning('High memory usage');           // [2024-03-20T15:30:45.124Z] [API] High memory usage
apiLogger.error('Database connection failed');     // [2024-03-20T15:30:45.125Z] [API] Database connection failed

// Create a logger instance without a prefix
const generalLogger = new Logger();
generalLogger.info('Application initialized');     // [2024-03-20T15:30:45.126Z] Application initialized
*/
