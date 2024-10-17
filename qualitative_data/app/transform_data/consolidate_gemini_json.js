import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the directory path and filename patterns
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data/');
const outputFilename = 'gemini_responses.json';

// Consolidate all matching JSON files
const consolidateJsonFiles = () => {
  try {
    // Read the files in the directory
    const files = fs.readdirSync(dataDir);
    
    // Filter files based on the naming pattern using regex
    const matchingFiles = files.filter(file => /gemini_responses_.*\.json$/.test(file));
    
    let consolidatedData = [];

    // Loop through the matching files and read their contents
    matchingFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      consolidatedData = consolidatedData.concat(fileContent);
    });

    // Write the consolidated data to the output file
    const outputPath = path.join(dataDir, outputFilename);
    fs.writeFileSync(outputPath, JSON.stringify(consolidatedData, null, 2), 'utf8');

    console.log(`Consolidated file created: ${outputFilename}`);
  } catch (error) {
    console.error('Error consolidating JSON files:', error);
  }
};

// Run the consolidation function
consolidateJsonFiles();