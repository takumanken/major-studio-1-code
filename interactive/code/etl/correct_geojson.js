// If using "type": "module" in package.json or a .mjs file extension

import fs from "fs";
import rewind from "@turf/rewind";

// Read your GeoJSON file
const geojsonData = fs.readFileSync("BIA_wgs84.geojson", "utf8");
const geojson = JSON.parse(geojsonData);

// Correct the winding order
const correctedGeoJSON = rewind(geojson, { reverse: true }); // 'reverse: true' ensures CCW for shells

// Write the corrected GeoJSON to a new file
const correctedData = JSON.stringify(correctedGeoJSON, null, 2);
fs.writeFileSync("corrected.geojson", correctedData);

console.log("Winding order corrected and saved to corrected.geojson");
