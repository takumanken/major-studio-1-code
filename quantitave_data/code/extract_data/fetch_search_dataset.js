const apiKey = "";

// Search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Constructing the initial search query
const search = 'unit_code:"NMNHMINSCI" AND topic=Meteorite AND place=Antarctica';
// Array that we will write into
let myArray = [];

// String that will hold the stringified JSON data
let jsonString = '';

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
        const numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
        console.log(`Total Rows: ${data.response.rowCount}, Number of Queries: ${numberOfQueries}`);
        
        for(let i = 0; i < numberOfQueries; i++) {
            // Calculate the number of rows for the current query
            const rows = (i === numberOfQueries - 1) 
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
        // Update jsonString after each fetch
        jsonString = JSON.stringify(myArray, null, 2); // Pretty-print with 2 spaces
        console.log("Current Array:", myArray);
    })
    .catch(error => {
        console.error("Error in fetchAllData:", error);
    });
}

// Create your own array with just the data you need
function addObject(objectData) {  
    const id = objectData.id ?? 'N/A';
    const title = objectData.title ?? 'N/A';
    const collection_date = objectData.content?.freetext?.date?.[0].content ?? 'N/A';
    const geolocation = objectData.content?.indexedStructured?.geoLocation?.[0]?.points?.point ?? 'N/A';
    const latitude = geolocation.latitude?.content ?? 'N/A';
    const longitude = geolocation.longitude?.content ?? 'N/A';
    const weight = objectData.content?.freetext?.physicalDescription?.[0].content ?? 'N/A';
    const link = objectData.content?.descriptiveNonRepeating?.record_link ?? 'N/A';

    myArray.push({
        id: id,
        title: title,
        collection_date: collection_date,
        latitude: latitude,
        longitude: longitude,
        weight: weight,
        link: link,
    });
}

// Start the data fetching process
fetchSearchData(search);
