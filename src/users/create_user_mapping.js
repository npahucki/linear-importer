import chalk from "chalk";
import getTeamMembers from "../teams/members.mjs";

import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";

import DetailedLogger from "../../logger/detailed_logger.mjs";

const detailedLogger = new DetailedLogger();

/**
 * Creates a mapping file that links external usernames to Linear users
 *
 * @param {Object} params
 * @param {Object} params.team - The Linear team object
 * @param {string} params.team.name - Used to generate the mapping file name (e.g., "team-name-user-mapping.json")
 * @param {string[]} params.extractedUsernames - Array of usernames found in the CSV import file
 *
 * This step:
 * 1. Creates/updates a JSON mapping file in the format:
 *    {
 *      "external_username": {
 *        linearId: string | null,
 *        linearName: string | null,
 *        linearEmail: string | null,
 *        note?: string  // Only present for unmatched users
 *      }
 *    }
 * 2. Prompts for Linear username matches if they don't exist
 * 3. Saves the mapping for use during issue creation
 */
async function createUserMapping({ team, extractedUsernames }) {
  if (extractedUsernames.length === 0) {
    detailedLogger.error("No extracted usernames found. Skipping...");
    process.exit(0);
  }

  detailedLogger.result(
    `Extracted usernames:\n${extractedUsernames.join("\n")}`,
  );
  detailedLogger.importantLoading(
    `Finding best matches for extracted usernames`,
  );

  // Fetch Team Members
  const { teamMembers } = await getTeamMembers({ teamId: team.id });

  // Check for existing mapping file
  const logDir = path.join(process.cwd(), "log", team.name);
  const mappingPath = path.join(logDir, "user_mapping.json");
  let existingMapping = {};
  let shouldRemap = false;
  let isNewMapping = false;

  try {
    const mappingFile = await fs.readFile(mappingPath, "utf8");
    const mappingData = JSON.parse(mappingFile);
    existingMapping = mappingData.mapping || {};

    detailedLogger.info(`Found existing user mapping file at: ${mappingPath}`);

    const { confirmRemap } = await inquirer.prompt([
      {
        type: "list",
        name: "confirmRemap",
        message:
          "Users have already been mapped for this team. Would you like to start fresh and remap all users?",
        choices: [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ],
        default: false,
      },
    ]);

    shouldRemap = confirmRemap;
    isNewMapping = shouldRemap;
    if (!shouldRemap) {
      detailedLogger.loading("Continuing with existing user mapping");
    }
  } catch (error) {
    detailedLogger.loading(
      "No existing user mapping file found. Starting with empty mapping...",
    );
    isNewMapping = true;
  }

  // Create user mapping
  const userMapping = shouldRemap ? {} : { ...existingMapping };
  const unmatchedUsers = [];
  let hasNewMappings = false;

  // First pass: automatic matching for users not in existing mapping
  for (const pivotalUser of extractedUsernames) {
    // Skip if user already has a mapping
    if (userMapping[pivotalUser]) {
      continue;
    }

    hasNewMappings = true;
    const matchedMember = await findBestUserMatch(
      pivotalUser,
      teamMembers.nodes,
    );
    if (matchedMember) {
      userMapping[pivotalUser] = {
        linearId: matchedMember.id,
        linearName: matchedMember.name,
        linearEmail: matchedMember.email,
      };
    } else {
      unmatchedUsers.push(pivotalUser);
    }
  }

  // Prompt for manual matching if there are unmatched users
  if (unmatchedUsers.length > 0) {
    console.log(
      chalk.yellow(
        "\n⚠️ The following usernames could not be automatically matched:",
      ),
    );
    console.log(chalk.green(unmatchedUsers.join("\n")));

    const { shouldManuallyMatch } = await inquirer.prompt([
      {
        type: "list",
        name: "shouldManuallyMatch",
        message: "Would you like to manually match these users?",
        choices: [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ],
        default: true,
      },
    ]);

    if (shouldManuallyMatch) {
      for (const unmatchedUser of unmatchedUsers) {
        const manualMatch = await promptForManualMatch(
          unmatchedUser,
          teamMembers.nodes,
        );

        userMapping[unmatchedUser] = manualMatch
          ? {
              linearId: manualMatch.id,
              linearName: manualMatch.name,
              linearEmail: manualMatch.email,
            }
          : {
              linearId: null,
              linearName: null,
              linearEmail: null,
              note: "No matching Linear user found (manual skip)",
            };
      }
    } else {
      detailedLogger.info("Skipping manual matching for unmatched users");
      // Add unmatched users to mapping with null values without prompting
      unmatchedUsers.forEach((unmatchedUser) => {
        userMapping[unmatchedUser] = {
          linearId: null,
          linearName: null,
          linearEmail: null,
          note: "No matching Linear user found (automatic skip)",
        };
      });
    }
  }

  // Save mapping if it's new, was remapped, or has new additions
  if (isNewMapping || hasNewMappings) {
    await fs.mkdir(logDir, { recursive: true });
    await fs.writeFile(
      mappingPath,
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          mapping: userMapping,
        },
        null,
        2,
      ),
    );
    detailedLogger.importantInfo(
      `User mapping: ${JSON.stringify(userMapping, null, 2)}`,
    );
    detailedLogger.result(`User mapping saved to ${mappingPath}`);
  }

  detailedLogger.importantSuccess("✅ Setup complete!");
  return userMapping;
}

async function findBestUserMatch(pivotalName, linearMembers) {
  // Convert pivotal name to lowercase and clean it
  const normalizedPivotalName = pivotalName.toLowerCase().trim();

  let bestMatch = {
    linearMember: null,
    score: 0,
  };

  for (const member of linearMembers) {
    let highestScore = 0;

    // Check against all available fields
    const fieldsToCheck = [
      { value: member.displayName, weight: 1.0 },
      { value: member.name, weight: 1.0 },
      { value: member.email?.split("@")[0], weight: 0.8 }, // Username part of email
      { value: member.initials, weight: 0.3 },
    ];

    for (const field of fieldsToCheck) {
      if (field.value) {
        const normalizedField = field.value.toLowerCase().trim();

        // Exact match gives highest score
        if (normalizedField === normalizedPivotalName) {
          highestScore = Math.max(highestScore, 1.0 * field.weight);
          continue;
        }

        // Check if pivotal name contains or is contained in the field
        if (
          normalizedField.includes(normalizedPivotalName) ||
          normalizedPivotalName.includes(normalizedField)
        ) {
          highestScore = Math.max(highestScore, 0.9 * field.weight);
          continue;
        }

        // Calculate similarity score
        const similarityScore =
          calculateSimilarity(normalizedPivotalName, normalizedField) *
          field.weight;
        highestScore = Math.max(highestScore, similarityScore);
      }
    }

    if (highestScore > bestMatch.score) {
      bestMatch = {
        linearMember: member,
        score: highestScore,
      };
    }
  }

  // Require a minimum score of 0.4 for a match
  return bestMatch.score > 0.4 ? bestMatch.linearMember : null;
}

function calculateSimilarity(str1, str2) {
  // Simple Levenshtein distance-based similarity
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1)
    .fill()
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost,
      );
    }
  }

  return matrix[str2.length][str1.length];
}

async function promptForManualMatch(pivotalUser, linearMembers) {
  const choices = linearMembers.map((member) => ({
    name: `${member.name} (${member.email})`,
    value: member,
  }));

  choices.push({ name: "Skip this user", value: null });

  const { selectedMember } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedMember",
      message: `Choose Linear team member for ${chalk.green(pivotalUser)}":`,
      choices: choices,
      pageSize: choices.length, // Show all choices at once
    },
  ]);

  return selectedMember;
}

export default createUserMapping;
