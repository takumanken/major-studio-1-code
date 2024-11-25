import fs from "fs";
import * as d3 from "d3";

// Load and parse the JSON file
const rawData = fs.readFileSync("../app/data/smithonian_data_raw.json", "utf-8");
const originalDataArray = JSON.parse(rawData);

// Extract Attributed Place from data
const attributedPlaceArray = originalDataArray.map(function (d) {
  const placeArray = d.content.freetext.place;
  if (Array.isArray(placeArray)) {
    return placeArray[0].content;
  }
});

const attributedPlaceArrayLength = attributedPlaceArray.length;
console.log(attributedPlaceArrayLength);

function getContinent(place) {
  if (place) {
    const match = place.match("(Antarctica|North America|Asia|Oceania|South America|Africa)");
    return match ? match[0] : null;
  }
}

// Aggregate
const aggregatedResult = d3
  .rollups(
    attributedPlaceArray,
    function (v) {
      const length = v.length;
      const length_ratio = length / attributedPlaceArrayLength;
      return {
        length: length,
        length_ratio: length_ratio,
      };
    },
    (d) => getContinent(d)
  )
  .filter((d) => d[0] !== null && d[0] !== undefined);

const result = aggregatedResult.sort((a, b) => b[1].length - a[1].length);
const jsonString = JSON.stringify(result); // Minimum output (no pretty-print)
const filename = "../app/data/attributed_locations.json";

fs.writeFile(filename, jsonString, "utf8", (err) => {
  if (err) console.log(err);
  else {
    console.log("File written successfully\n");
    console.log("The written file has the following contents:");
  }
});
