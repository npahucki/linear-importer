import Logger from "./logger.mjs";
import DetailedLogger from "./detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

function initializeLogger({ team }) {
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

export default initializeLogger;
