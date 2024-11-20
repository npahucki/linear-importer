import Logger from './logger.mjs';

export function setupLogger(teamName) {
  // Generate a unique filename for the log
  const generateLogFilename = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `output_${timestamp}.txt`;
  };

  // Initialize and enable the logger
  const logFilename = generateLogFilename();
  const logger = new Logger(logFilename, teamName);
  logger.enable();

  return logger;
}