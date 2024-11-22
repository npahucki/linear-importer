import fs from 'fs/promises';
import Logger from './logger.mjs';

const readSuccessfulImports = async (teamName) => {
  if (!teamName) {
    console.warn('No team name provided to readSuccessfulImports');
    return new Set();
  }

  try {
    const filePath = Logger.getTeamLogPath(teamName, 'successful_imports.csv');
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log(`No existing import log found for team "${teamName}"`);
      return new Set();
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header row
    
    const successfulImports = new Set(
      lines
        .filter(line => line.trim()) // Remove empty lines
        .map(line => {
          const [, id] = line.split(',');
          return id?.trim(); // Ensure ID is trimmed
        })
        .filter(Boolean) // Remove any undefined/null/empty values
    );

    // console.log(`Found ${successfulImports.size} previously imported stories for team "${teamName}"`);
    return successfulImports;

  } catch (error) {
    console.error(`Error reading successful imports for team "${teamName}":`, error);
    return new Set();
  }
};

export default readSuccessfulImports;