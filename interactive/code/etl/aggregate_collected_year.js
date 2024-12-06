import fs from "fs";
import * as d3 from "d3";

// Load and parse the JSON file
const rawData = fs.readFileSync("../app/data/smithonian_data_raw.json", "utf-8");
const originalDataArray = JSON.parse(rawData);

console.log(originalDataArray.slice(0, 5).map((d) => d?.content?.freetext?.date?.[0]?.content));

// Extract Attributed Place from data
const yearArray = originalDataArray
  .map(function (d) {
    const year = d?.content?.freetext?.date?.[0]?.content;
    return year;
  })
  .filter((d) => d !== undefined);

const yearArrayLength = yearArray.length;
console.log(yearArrayLength);

// Aggregate
const aggregatedResult = d3.rollups(
  yearArray,
  (v) => v.length,
  (d) => d
);

const result = aggregatedResult.sort((a, b) => b[0] - a[0]);
const jsonString = JSON.stringify(result);
const filename = "../app/data/collected_year.json";

fs.writeFile(filename, jsonString, "utf8", (err) => {
  if (err) console.log(err);
  else {
    console.log("File written successfully\n");
    console.log("The written file has the following contents:");
  }
});
