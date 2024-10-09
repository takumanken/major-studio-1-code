import { SMITHSONIAN_API_KEY } from "../../../secrets.js";
import fetch from 'node-fetch';
import fs from 'fs';

const apiKey = SMITHSONIAN_API_KEY;

// Search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Constructing the initial search query
const search = 'unit_code:"NPG" AND "portrait" AND "painting" AND online_media_type:"Images"';

// Array that we will write into
let myArray = [];

// Counter to track the number of completed fetch requests
let completedRequests = 0;

// Total number of queries (will be determined after the initial search)
let totalQueries = 0;

// Search: fetches an array of terms based on term category
function fetchSearchData(searchTerm) {
    // Encode the search term to ensure it's URL-safe
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    let url = `${searchBaseURL}?api_key=${apiKey}&q=${encodedSearchTerm}`;
    console.log("Initial Search URL:", url);
    
    fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log("Initial Search Data:", data);
        
        // Check if the response and rowCount exist
        if (!data.response || typeof data.response.rowCount !== 'number') {
            throw new Error("Invalid response structure");
        }

        // Constructing search queries to get all the rows of data
        const pageSize = 1000;
        totalQueries = Math.ceil(data.response.rowCount / pageSize);
        console.log(`Total Rows: ${data.response.rowCount}, Number of Queries: ${totalQueries}`);
        
        for(let i = 0; i < totalQueries; i++) {
            // Calculate the number of rows for the current query
            const rows = (i === totalQueries - 1) 
                ? data.response.rowCount - (i * pageSize) 
                : pageSize;
            
            // Declare searchAllURL with 'let' to ensure it's scoped correctly
            let searchAllURL = `${searchBaseURL}?api_key=${apiKey}&q=${encodedSearchTerm}&start=${i * pageSize}&rows=${rows}`;
            console.log(`Search URL ${i + 1}:`, searchAllURL);
            
            fetchAllData(searchAllURL);
        }
    })
    .catch(error => {
        console.error("Error in fetchSearchData:", error);
    });
}

// Fetching all the data listed under our search and pushing them all into our custom array
function fetchAllData(url) {
    fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log("Fetched Data:", data);

        // Check if rows exist in the response
        if (!data.response || !Array.isArray(data.response.rows)) {
            throw new Error("Invalid data structure in fetchAllData");
        }

        data.response.rows.forEach(function(n) {
            try {
                addObject(n);
            } catch (error) {
                console.error(`Error processing object ID ${n.id}:`, error);
            }
        });

        // Increment the completed requests counter
        completedRequests++;

        // Check if all requests are completed
        if (completedRequests === totalQueries) {
            // Once all data is fetched, stringify and save it to a file
            const jsonString = JSON.stringify(myArray, null, 2); // Pretty-print with 2 spaces
            console.log("All Data Fetched. Saving to file...");
            saveDataToFile(jsonString, "./data/portraits_painting.json");
        }

    })
    .catch(error => {
        console.error("Error in fetchAllData:", error);
    });
}

// Create your own array with the entire object
function addObject(objectData) {  
    // Instead of extracting specific fields, we push the entire object
    myArray.push(objectData);
}

// Function to save data as a JSON file
function saveDataToFile(data, filename) {
    fs.writeFile(filename, data, 'utf8', (err) => {
        if (err) {
            console.error(`Error saving data to file: ${err}`);
        } else {
            console.log(`Data successfully saved to ${filename}`);
        }
    });
}

// Start the data fetching process
fetchSearchData(search);
