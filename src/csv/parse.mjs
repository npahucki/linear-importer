import { fileURLToPath } from "url";

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import fs from "fs/promises";
import path from "path";

import { buildParams } from "./_utils.js";
import selectDirectory from "../prompts/select_csv_directory.js";

// Function to list directories in the assets directory
async function listDirectories(directory) {
  const items = await fs.readdir(directory, { withFileTypes: true });
  return items.filter((item) => item.isDirectory()).map((item) => item.name);
}

// Function to read and parse CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const pivotalStories = [];
    const releaseStories = [];
    const labels = new Set();
    const statusTypes = new Set();
    const requestedBy = new Set();
    const ownedBy = new Set();

    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          group_columns_by_name: true,
          trim: true,
          relax_column_count: true,
        }),
      )
      .on("data", (row) => {
        const params = buildParams(row);

        // Add status type to Set if it exists
        if (row["Type"]) {
          statusTypes.add(row["Type"]);
        }

        if (row["Requested By"]) {
          requestedBy.add(row["Requested By"]);
        }

        if (row["Owned By"]) {
          // If Owned By is already an array, add each owner to the Set
          (Array.isArray(row["Owned By"]) ? row["Owned By"] : [row["Owned By"]])
            .filter((owner) => owner) // Remove empty values
            .forEach((owner) => ownedBy.add(owner));
        }

        // Add labels to Set if they exist
        if (row["Labels"]) {
          // Split labels on comma and trim whitespace
          row["Labels"]
            .split(",")
            .map((label) => label.trim())
            .filter((label) => label) // Remove empty strings
            .forEach((label) => labels.add(label));
        }

        // Separate release stories so that we can attach sub-issues to them
        if (row["Type"] == "release") {
          const releaseRowFormatted = {
            ...params,
            name: row["Iteration"]
              ? `[${row["Iteration"]}] ${row["Title"]}`
              : row["Title"],
            dueDate: row["Iteration End"],
          };

          releaseStories.push(releaseRowFormatted);
        } else {
          const rowFormatted = {
            ...params,
            dueDate: row["Accepted at"] || row["Iteration End"],
          };

          pivotalStories.push(rowFormatted);
        }
      })
      .on("end", () =>
        resolve({
          releaseStories,
          pivotalStories,
          labels: buildLabelsArray(labels),
          statusTypes: Array.from(statusTypes),
          pivotalUsers: Array.from(new Set([...ownedBy, ...requestedBy])),
          requestedBy: Array.from(requestedBy),
          ownedBy: Array.from(ownedBy),
        }),
      )
      .on("error", reject);
  });
}

function buildLabelsArray(labels) {
  return Array.from(labels).map((label) => ({
    name: label,
    color: "#6C757D",
  }));
}

// Main function to run the script
async function parseCSV() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsDir = path.join(__dirname, "..", "..", "assets");

  const directories = await listDirectories(assetsDir);

  if (directories.length === 0) {
    console.log("No directories found in the assets directory.");
    return;
  }

  const selectedDirectory = await selectDirectory(directories);
  const csvFilename = `${selectedDirectory.replace("-export", "")}.csv`;
  const filePath = path.join(assetsDir, selectedDirectory, csvFilename);

  return parseCSVFile(csvFilename, filePath);
}

export async function parseCSVFile(csvFilename, filePath) {
  if (
    !(await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false))
  ) {
    console.log(`CSV file not found: ${csvFilename}`);
    process.exit(1);
  }

  const data = await readCSV(filePath);
  return { csvFilename, ...data };
}

export default parseCSV;
