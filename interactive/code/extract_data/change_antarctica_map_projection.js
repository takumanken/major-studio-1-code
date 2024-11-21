// hoge.js
import fs from "fs/promises";
import proj4 from "proj4";

const fileContent = await fs.readFile("./antarctica.geojson", "utf8");
const data = JSON.parse(fileContent);

proj4.defs(
  "EPSG:3031",
  "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs"
);

function transformCoordinates(coordinates) {
  // Transform coordinates from EPSG:3031 to WGS84
  return coordinates.map((coord) => {
    const [lon, lat] = coord;
    return proj4("EPSG:3031", "WGS84", [lon, lat]);
  });
}

data.features.forEach((feature) => {
  feature.geometry.coordinates = feature.geometry.coordinates.map(transformCoordinates);
});

const transformedData = JSON.stringify(data, null, 2);
const outputFilePath = "./antarctica_wgs84.geojson";
await fs.writeFile(outputFilePath, transformedData, "utf8");
