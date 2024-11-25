import fs from "fs";
import * as d3 from "d3";

const rawData = fs.readFileSync("../app/data/smithonian_data_raw.json", "utf-8");
const originalJSON = JSON.parse(rawData);

const transformedJSON = originalJSON.map(function (record) {
  const id = record.id;
  const geoLocationDict = record?.content?.indexedStructured?.geoLocation?.[0] ?? null;
  const latitudeLongitudeDict = geoLocationDict?.points?.point ?? null;

  if (latitudeLongitudeDict !== null) {
    const continent = geoLocationDict.L1.type === "Continent" ? geoLocationDict.L1.content : null;
    const latitude = +latitudeLongitudeDict.latitude.content;
    const longitude = +latitudeLongitudeDict.longitude.content;

    return { id: id, continent: continent, latitude: latitude, longitude: longitude };
  }
});

const AntarcticaJSON = transformedJSON.filter((d) => d?.continent === "Antarctica");
const jsonString = JSON.stringify(AntarcticaJSON);
const filename = "../app/data/antarctica_meteorites.json";

fs.writeFile(filename, jsonString, "utf8", (err) => {
  if (err) console.log(err);
  else {
    console.log("File written successfully\n");
    console.log("The written file has the following contents:");
  }
});
