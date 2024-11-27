import { fileURLToPath } from "url";

import DetailedLogger from "../../logger/detailed_logger.mjs";

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import fs from "fs/promises";
import path from "path";

import { buildParams } from "./_utils.js";

const detailedLogger = new DetailedLogger();

// Function to read and parse CSV
function readCSV(filePath) {
  detailedLogger.info(`Reading CSV file: ${filePath}`);

  return new Promise((resolve, reject) => {
    const issues = [];
    const labels = new Set();
    const statusTypes = new Set();
    const userNames = new Set();

    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          group_columns_by_title: true,
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

        // Requested By
        if (row["Requested By"]) userNames.add(row["Requested By"]);

        if (row["Owned By"]) {
          // If Owned By is already an array, add each owner to the Set
          (Array.isArray(row["Owned By"]) ? row["Owned By"] : [row["Owned By"]])
            .filter((owner) => owner)
            .forEach((owner) => userNames.add(owner));
        }

        // Add labels to Set if they exist
        if (row["Labels"]) {
          // Split labels on comma and trim whitespace
          row["Labels"]
            .split(",")
            .map((label) => label.trim())
            .filter((label) => label)
            .forEach((label) => labels.add(label));
        }

        // Separate release stories so that we can attach sub-issues to them
        if (row["Type"] == "release") {
          const formattedRow = {
            ...params,
            title: row["Iteration"]
              ? `[${row["Iteration"]}] ${row["Title"]}`
              : row["Title"],
            dueDate: row["Iteration End"],
            isParentIssue: true,
          };

          issues.push(formattedRow);
        } else {
          const formattedRow = {
            ...params,
            dueDate: row["Accepted at"] || row["Iteration End"],
          };

          issues.push(formattedRow);
        }
      })
      .on("end", () =>
        resolve({
          issues,
          aggregatedData: {
            userNames: Array.from(new Set([...userNames])),
            labels: buildLabelsArray(labels),
            statusTypes: Array.from(statusTypes),
          },
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
async function parseCSV(selectedDirectory) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsDir = path.join(__dirname, "..", "..", "assets");

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

  detailedLogger.success(`CSV Data: ${JSON.stringify(data, null, 2)}`);

  return data;
}

export default parseCSV;
