import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Directory where thumbnails will be saved
const THUMBNAILS_DIR = '../../data/thumbnails';
// JSON file containing the transformed data
const JSON_FILE_PATH = '../../data/transformed_data.json';

// Create the thumbnails directory if it doesn't exist
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// Function to download a single thumbnail
const downloadThumbnail = async (url, filename) => {
  const filePath = path.join(THUMBNAILS_DIR, filename);
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve();
      });

      response.data.on('error', (err) => {
        console.error(`Error downloading ${filename}: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Failed to download ${filename}: ${error.message}`);
  }
};

// Main function to download all thumbnails
const downloadAllThumbnails = async () => {
  try {
    const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const data = JSON.parse(rawData);

    for (const item of data) {
      if (item.thumbnailLink) {
        const filename = `${item.id}.jpg`;
        await downloadThumbnail(item.thumbnailLink, filename);
      }
    }
  } catch (error) {
    console.error(`Error reading JSON file or downloading thumbnails: ${error.message}`);
  }
};

// Run the function
downloadAllThumbnails();

// Install the required dependencies by running:
// npm install axios