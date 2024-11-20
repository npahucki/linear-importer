import createLabels from './labels/create.mjs';
import createStatusesForTeam from './statuses/create.mjs';
import chalk from 'chalk';
import getTeamMembers from './teams/members.mjs';
import fs from 'fs/promises';
import path from 'path';

export const RELEASE_LABEL_NAME = "pivotal - release";
const FEATURE_LABEL_NAME = "pivotal - feature";
const CHORE_LABEL_NAME = "pivotal - chore";
const BUG_LABEL_NAME = "pivotal - bug";
const EPIC_LABEL_NAME = "pivotal - epic";

const LABELS_TO_CREATE = [
  { name: FEATURE_LABEL_NAME, color: "#ed7d1a" },
  { name: CHORE_LABEL_NAME, color: "#e0e2e5" },  
  { name: BUG_LABEL_NAME, color: "#FF5630" },     
  { name: RELEASE_LABEL_NAME, color: "#407aa5" }, 
  { name: EPIC_LABEL_NAME, color: "#452481" },
];

async function findBestUserMatch(pivotalName, linearMembers) {
  // Convert both names to lowercase for better matching
  const normalizedPivotalName = pivotalName.toLowerCase();
  
  let bestMatch = {
    linearMember: null,
    score: 0
  };

  for (const member of linearMembers) {
    // Check against both display name and full name
    const displayNameScore = calculateSimilarity(normalizedPivotalName, member.displayName.toLowerCase());
    const fullNameScore = calculateSimilarity(normalizedPivotalName, member.name.toLowerCase());
    
    const score = Math.max(displayNameScore, fullNameScore);
    
    if (score > bestMatch.score) {
      bestMatch = {
        linearMember: member,
        score: score
      };
    }
  }

  return bestMatch.score > 0.5 ? bestMatch.linearMember : null;
}

function calculateSimilarity(str1, str2) {
  // Simple Levenshtein distance-based similarity
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function init({ teamId, teamName, pivotalUsers }) {
  console.log(chalk.magenta('Setting up...'));
  
  await createLabels({ teamId, labels: LABELS_TO_CREATE });
  await createStatusesForTeam({ teamId });

  const { teamMembers } = await getTeamMembers({ teamId, teamName });

  console.log('pivotalUsers here! ', pivotalUsers);
  console.log('teamMembers here! ', teamMembers);
  
  // Create user mapping
  const userMapping = {};
  for (const pivotalUser of pivotalUsers) {
    const matchedMember = await findBestUserMatch(pivotalUser, teamMembers.nodes);
    if (matchedMember) {
      userMapping[pivotalUser] = {
        linearId: matchedMember.id,
        linearName: matchedMember.name,
        linearEmail: matchedMember.email
      };
    }
  }

  // Save mapping to log file
  const logDir = path.join(process.cwd(), '..', 'log', teamName);
  await fs.mkdir(logDir, { recursive: true });
  
  const mappingPath = path.join(logDir, 'user-mapping.json');
  await fs.writeFile(
    mappingPath, 
    JSON.stringify(userMapping, null, 2)
  );

  console.log(chalk.green(`User mapping saved to ${mappingPath}`));
  console.log(chalk.magenta('Setup complete!'));
  
  return userMapping;
}

export default init;