import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import csv from 'csv-parser';

// File paths
const INPUT_FILE = "../../data/wiki_url.csv";
const OUTPUT_FILE = "../../data/wiki_contents.json";

// Read CSV data from the input file
const wikiData = [];

fs.createReadStream(INPUT_FILE)
  .pipe(csv())
  .on('data', (row) => {
    wikiData.push(row);
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    await fetchContent();
  })
  .on('error', (err) => {
    console.error("Error reading input file:", err);
    process.exit(1);
  });

// Extract content from Wikipedia URLs
const extractedContents = [];

const fetchContent = async () => {
  for (const record of wikiData) {
    const url = record["Wikipedia URL"];
    if (!url || url === '-') {
      continue;
    }

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const content = $('#mw-content-text > div.mw-content-ltr.mw-parser-output').text();

      if (content) {
        extractedContents.push({
          id: record["Id"],
          wikiURL: url,
          content: content
        });
      } else {
        console.log(`No specific content found for URL ${url}`);
      }
    } catch (err) {
      console.log(`Failed to fetch content for URL: ${url}`);
    }
  }

  // Write the extracted contents to the output file
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedContents, null, 4));
    console.log("Data successfully written to", OUTPUT_FILE);
  } catch (err) {
    console.error("Error writing to output file:", err);
  }
};