import { SMITHSONIAN_API_KEY } from "../../../secrets.js";
import fetch from "node-fetch";
import fs from "fs";

const apiKey = SMITHSONIAN_API_KEY;
console.log(apiKey);

// Search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Constructing the initial search query
// const search = 'unit_code:"NMNH" AND "topic:"Meteorites"';
const search = unit_code:"NPG" AND "portrait"";

// Array that we will write into
let myArray = [];

// Counter to track the number of completed fetch requests
let completedRequests = 0;

// Total number of queries (will be determined after the initial search)
let totalQueries = 0;

// Search: fetches an array of terms based on term category
function fetchSearchData(searchTerm) {
  const encodedSearchTerm = encodeURIComponent(searchTerm);
  let url = `${searchBaseURL}?api_key=${apiKey}&q=${encodedSearchTerm}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.response || typeof data.response.rowCount !== "number") {
        throw new Error("Invalid response structure");
      }

      console.log("we-i");

      const pageSize = 1000;
      totalQueries = Math.ceil(data.response.rowCount / pageSize);

      console.log(totalQueries);

      for (let i = 0; i < totalQueries; i++) {
        const rows = i === totalQueries - 1 ? data.response.rowCount - i * pageSize : pageSize;

        let searchAllURL = `${searchBaseURL}?api_key=${apiKey}&q=${encodedSearchTerm}&start=${
          i * pageSize
        }&rows=${rows}`;
        fetchAllData(searchAllURL);
      }
    })
    .catch((error) => {
      console.error("Error in fetchSearchData:", error);
    });
}

// Fetching all the data listed under our search and pushing them all into our custom array
function fetchAllData(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.response || !Array.isArray(data.response.rows)) {
        throw new Error("Invalid data structure in fetchAllData");
      }

      data.response.rows.forEach(function (n) {
        try {
          addObject(n);
        } catch (error) {
          console.error(`Error processing object ID ${n.id}:`, error);
        }
      });

      completedRequests++;

      if (completedRequests === totalQueries) {
        const jsonString = JSON.stringify(myArray); // Minimum output (no pretty-print)
        saveDataToFile(jsonString, "data/smithonian_data_raw.json");
      }
    })
    .catch((error) => {
      console.error("Error in fetchAllData:", error);
    });
}

// Create your own array with the entire object
function addObject(objectData) {
  myArray.push(objectData);
}

// Function to save data as a JSON file
function saveDataToFile(data, filename) {
  fs.writeFile(filename, data, "utf8", (err) => {
    if (err) {
      console.error(`Error saving data to file: ${err}`);
    } else {
      console.log(`Data successfully saved to ${filename}`);
    }
  });
}

// Start the data fetching process
fetchSearchData(search);
