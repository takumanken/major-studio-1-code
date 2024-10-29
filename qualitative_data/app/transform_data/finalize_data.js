import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the paths to the files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const geminiResponsesPath = path.join(__dirname, './data/gemini_responses.json');
const transformedDataPath = path.join(__dirname, './data/smithonian_data_transformed.json');
const outputPath = path.join(__dirname, './data/finalized_data.json');

// Function to read JSON file
function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      const jsonData = JSON.parse(data);
      resolve(jsonData);
    });
  });
}

// Function to perform inner join based on 'id' key
function innerJoin(array1, array2, key) {
  const map = new Map();
  array1.forEach(item => map.set(item[key], item));
  return array2.reduce((result, item) => {
    if (map.has(item[key])) {
      result.push({ ...map.get(item[key]), ...item });
    }
    return result;
  }, []);
}

(async () => {
  // Read the content of both files
  const geminiResponses = await readJsonFile(geminiResponsesPath);
  const transformedData = await readJsonFile(transformedDataPath);

  // Perform the inner join using 'id' as the key
  const joinedData = innerJoin(geminiResponses, transformedData, 'id');

  // Calculate the birth year, death year, age at portrait, and age group
  joinedData.forEach(record => {

    // Assume that the period field is always in the format "YYYY-YYYY"
    const regex = /[0-9]{4}/g;
    const found = record.period.match(regex) || [];
    
    // Function to validate the year
    function getValidYearInt(year) {
      year = parseInt(year);      
      if (
        year >= 0 &&
        year <= new Date().getFullYear()
      ) {
        return parseInt(year);
      }
    }

    const birthYear = getValidYearInt(found[0]);
    const deathYear = getValidYearInt(found[1]);
    const portraitYear = record.portraitYear.yearInt;

    let age = null;
    let ageGroup = 'Unknown';
  
    // Calculate the age at the time of the portrait
    if (birthYear <= portraitYear && portraitYear <= deathYear) {
      age = portraitYear - birthYear;
      ageGroup = `${Math.floor(age / 10) * 10}s`;
    }  

    record.birthYear = birthYear;
    record.deathYear = deathYear;
    record.ageAtPortrait = { ageInt: age, ageGroup: ageGroup };
    record.isSelfPortrait = (record.isSelfPortrait) ? 'Yes' : 'No';
    record.categories = record.categories.map(category => category.replace(" and ", " & "));

  });
  
  // Write the joined data to a new file
  fs.writeFile(outputPath, JSON.stringify(joinedData, null, 2), () => {
    console.log('Finalized data has been written to finalized_data.json');
  });
  
})();