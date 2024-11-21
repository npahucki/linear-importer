import fs from 'fs/promises';
import Logger from './logger.mjs';

const readSuccessfulImports = async (teamName) => {
  try {
    const filePath = Logger.getTeamLogPath(teamName, 'successful_imports.csv');
    
    try {
      await fs.access(filePath);
    } catch {
      // If file doesn't exist, return empty set
      return new Set();
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header row
    
    return new Set(
      lines
        .filter(line => line.trim()) // Remove empty lines
        .map(line => line.split(',')[1]) // Get ID from CSV
    );
  } catch (error) {
    console.error('Error reading successful imports:', error);
    return new Set();
  }
};

export default readSuccessfulImports;