import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

export function setupLogger(teamName) {
  // Generate a unique filename for the log
  const generateLogFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    return `output_${timestamp}.txt`;
  };

  // Initialize and enable the logger
  const logFilename = generateLogFilename();
  const logger = new Logger(logFilename, teamName);
  logger.enable();

  return logger;
}

// import2.mjs
export function initializeLogger(team) {
  const detailedLogger = new DetailedLogger();
  detailedLogger.info(`Initialized logger for team: ${team.name}`);

  // Generate a unique filename for the log
  const generateLogFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    return `output_${timestamp}.txt`;
  };

  // Initialize and enable the logger
  const logFilename = generateLogFilename();
  const logger = new Logger(logFilename, team.name);
  logger.enable();

  return logger;
}
