import { uploadFileToLinear } from '../files/import.mjs';
import fs from 'fs/promises';
import path from 'path';
import chalk from "chalk";

async function upload(filePath, issueId) {
  try {
    // Read the file from the provided path
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const fileType = getFileType(fileName);
    
    // Create a file-like object
    const file = {
      name: fileName,
      type: fileType,
      size: fileBuffer.length,
      arrayBuffer: async () => fileBuffer,
    };

    // Upload the file and attach it to the issue
    const assetUrl = await uploadFileToLinear(file, issueId);
    
    // console.log(chalk.yellow(`File uploaded successfully and attached to issue ${issueId}`));
    console.log(chalk.magenta(`Asset URL: ${assetUrl}`));
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

function getFileType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case '.pdf': return 'application/pdf';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

// Get command line arguments
// const [,, filePath, issueId] = process.argv;

// if (!filePath || !issueId) {
//   console.error('Usage: node src/examples/fileUploadExample.mjs <file_path> <issue_id>');
//   process.exit(1);
// }

// Run the example
// upload(filePath, issueId);
export default upload;
