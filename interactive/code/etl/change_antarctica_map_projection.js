// hoge.js
import fs from "fs/promises";
import proj4 from "proj4";
import rewind from "geojson-rewind";

// Define source and destination CRS
const sourceCRS = "EPSG:3031";
const destCRS = "EPSG:4326"; // WGS84

// Define EPSG:3031 projection
proj4.defs(
  sourceCRS,
  "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 " + "+x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs"
);

// No need to define WGS84 as proj4 has it built-in

// Recursive function to transform coordinates
function transformCoordinates(coords) {
  if (typeof coords[0] === "number") {
    // Base case: [x, y] in EPSG:3031
    const transformed = proj4(sourceCRS, destCRS, coords);
    // Validate the transformed coordinates
    if (!transformed || transformed.length < 2 || !isFinite(transformed[0]) || !isFinite(transformed[1])) {
      throw new TypeError("Transformed coordinates must be finite numbers");
    }
    return [transformed[0], transformed[1]];
  } else if (Array.isArray(coords)) {
    // Recursive case: nested arrays
    return coords.map(transformCoordinates);
  } else {
    throw new TypeError("Invalid coordinate format");
  }
}

async function reprojectGeoJSON() {
  try {
    // Read and parse the GeoJSON file
    const fileContent = await fs.readFile("./bia.geojson", "utf8");
    const data = JSON.parse(fileContent);

    // Ensure the GeoJSON has the expected structure
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error("Invalid GeoJSON: Missing 'features' array.");
    }

    // Transform all feature coordinates
    data.features.forEach((feature, featureIndex) => {
      if (feature.geometry && feature.geometry.coordinates && typeof feature.geometry.type === "string") {
        try {
          feature.geometry.coordinates = transformCoordinates(feature.geometry.coordinates);
        } catch (err) {
          console.error(`Error transforming feature at index ${featureIndex}:`, err);
        }
      } else {
        console.warn(`Feature at index ${featureIndex} is missing geometry or coordinates.`);
      }
    });

    // Remove the old CRS definition
    delete data.crs;

    // Rewind the GeoJSON to enforce the right-hand rule
    rewind(data, true); // The second parameter 'reverse' is set to true to ensure exterior rings are CCW

    // Write the transformed GeoJSON to a new file
    const transformedData = JSON.stringify(data, null, 2);
    const outputFilePath = "./bia_wgs84_corrected.geojson";
    await fs.writeFile(outputFilePath, transformedData, "utf8");

    console.log(`Transformed and corrected GeoJSON saved to ${outputFilePath}`);
  } catch (error) {
    console.error("Error during GeoJSON transformation:", error);
  }
}

reprojectGeoJSON();
