import fs from 'fs';
import path from 'path';
import util from 'util';

class Logger {
  getTeamLogPath(teamName, filename) {
    return path.join(this.baseLogDir, teamName, filename);
  }
  constructor(logFilePath, teamName) {
    this.teamName = teamName;
    this.baseLogDir = '../log';
    this.teamLogDir = path.join(this.baseLogDir, teamName);
    this.logFilePath = path.join(this.teamLogDir, logFilePath);
    
    this.ensureDirectoryExistence(this.logFilePath);
    this.logFile = fs.createWriteStream(this.logFilePath, { flags: 'a' });
    
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }

  enable() {
    console.log = (...args) => {
      const message = util.format(...args);
      this.logFile.write(message + '\n');
      this.originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = util.format(...args);
      this.logFile.write('ERROR: ' + message + '\n');
      this.originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = util.format(...args);
      this.logFile.write('WARNING: ' + message + '\n');
      this.originalConsoleWarn.apply(console, args);
    };
  }

  disable() {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  close() {
    this.logFile.end();
  }
}

export default Logger;