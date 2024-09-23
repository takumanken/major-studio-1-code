// Import styles and libraries
import "./style.css";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import proj4 from "proj4"; // Assuming proj4 is available

// -----------------------------
// Constants and Configuration
// -----------------------------

// SVG dimensions
const WIDTH = 1920;
const HEIGHT = 1080;

// Menu layout constants
const MENU_WIDTH = 458;
const MARGIN_LEFT = 30;
const MARGIN_TOP = 30;

// Projection settings
const STEREOGRAPHIC_CENTER = [135, -82.8628];
const STEREOGRAPHIC_SCALE = 1500;
const STEREOGRAPHIC_PRECISION = 0.1;

// Hexbin settings
const HEXBIN_RADIUS = 25;

// Color scales
const COLOR_SCALE = d3.scaleSequential(d3.interpolateRgb("#B4D2D9", "#0688A6"))
  .domain([0, 0]); // Domain will be updated based on data

// Formatter
const FORMAT_COUNT = d3.format(".0s");

// -----------------------------
// SVG Setup
// -----------------------------

// Create the main SVG element
const svg = d3.select("body")
  .append("svg")
  .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .style("background-color", "#6DCBD3")
  .style("box-shadow", "0px 1px 2px #DDDDDD");

// -----------------------------
// Menu Setup
// -----------------------------

// Create a group for the menu
const svgMenu = svg.append("g")
  .attr("id", "menu");

// Define drop shadow filter for the menu
const defs = svgMenu.append("defs");
defs.append("filter")
  .attr("id", "drop-shadow")
  .append("feDropShadow")
  .attr("dx", 10)
  .attr("dy", 10)
  .attr("stdDeviation", 0.5)
  .attr("flood-color", "white")
  .attr("flood-opacity", 0.5);

// Create the menu background rectangle
svgMenu.append("rect")
  .attr("id", "menu-background")
  .attr("x", MARGIN_LEFT)
  .attr("y", MARGIN_TOP)
  .attr("width", MENU_WIDTH)
  .attr("height", HEIGHT - 2 * MARGIN_TOP)
  .attr("fill", "#FEFEFE")
  .attr("rx", 66)
  .attr("ry", 66)
  .attr("opacity", 0.85)
  .attr("filter", "url(#drop-shadow)");

// Add menu text
const textX = MENU_WIDTH / 2 + MARGIN_LEFT;

svgMenu.append("text")
  .attr("x", textX)
  .attr("y", 138)
  .attr("width", MENU_WIDTH)
  .attr("dominant-baseline", "middle")
  .attr("text-anchor", "middle")
  .attr("font-size", 64)
  .attr("font-family", "Anton")
  .attr("fill", "#3B6D8C")
  .text("Meteorites")
  .append("tspan")
  .attr("x", textX)
  .attr("dy", "72")
  .text("in Antarctica");

// -----------------------------
// Map Setup
// -----------------------------

// Create the map group and set its transformation
const svgMap = svg.append("g")
  .attr("id", "map")
  .attr("transform", "translate(800, 370) scale(0.95)");

// Define the projection for D3 (Stereographic)
const projection = d3.geoStereographic()
  .center(STEREOGRAPHIC_CENTER)
  .scale(STEREOGRAPHIC_SCALE)
  .precision(STEREOGRAPHIC_PRECISION);

const path = d3.geoPath().projection(projection);

// Define EPSG:3031 projection using Proj4
proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs");

// -----------------------------
// Utility Functions
// -----------------------------


// Transforms coordinates from EPSG:3031 to WGS84.
function transformCoordinates(coordinates) {
  return coordinates.map(coord => {
    const [x, y] = coord;
    const [lon, lat] = proj4("EPSG:3031", "WGS84", [x, y]);
    return [lon, lat];
  });
}

// Calculates the brightness of a hex color.
function getBrightness(hexColor) {
  const rgb = d3.rgb(hexColor);
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114); // Standard brightness formula
}

// -----------------------------
// Rendering Functions
// -----------------------------


// Draws the Antarctica map using GeoJSON data.
function drawMap(mapData) {
  // Transform coordinates of the features
  mapData.features.forEach(feature => {
    feature.geometry.coordinates = feature.geometry.coordinates.map(transformCoordinates);
  });

  // Bind data and create one path per GeoJSON feature
  svgMap.selectAll("path.land")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("fill", "white")
    .attr("class", "land")
    .attr("d", path);
}

// Creates a hexbin heatmap for meteorite data.
function createHeatmap(pointData) {
  // Convert data into projected coordinates
  const points = pointData.map(d => projection([+d.longitude, +d.latitude]));

  // Create a hexbin generator
  const hexbin = d3Hexbin()
    .extent([[0, 0], [WIDTH, HEIGHT]])
    .radius(HEXBIN_RADIUS);

  const hexbinData = hexbin(points);

  // Update color scale domain based on data
  const maxCount = d3.max(hexbinData, d => d.length);
  COLOR_SCALE.domain([0, maxCount]);

  // Append hexagons to the map
  const hexGroup = svgMap.append("g")
    .attr("class", "hexagon")
    .selectAll("g")
    .data(hexbinData)
    .enter()
    .append("g")
    .attr("class", "hexbin");

  // Draw hexagon paths
  hexGroup.append("path")
    .attr("d", d => hexbin.hexagon())
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("fill", d => COLOR_SCALE(d.length))
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  // Add labels to each hexbin
  hexGroup.append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y + 7) // Center text vertically
    .attr("text-anchor", "middle")
    .attr("font-size", 17.5)
    .attr("font-weight", "bold")
    .attr("fill", d => {
      const hexColor = COLOR_SCALE(d.length);
      const brightness = getBrightness(hexColor);
      return brightness < 150 ? "white" : "#343434";
    })
    .style("pointer-events", "none")
    .text(d => FORMAT_COUNT(d.length));

  // Create a tooltip element
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "5px")
    .style("background", "rgba(255, 255, 255, 0.8)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

  // Add tooltip events for each hexbin path
  hexGroup.select("path")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("stroke", "black"); // Highlight the edge

      tooltip.style("visibility", "visible")
        .text(`Number of Meteorites: ${d.length}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", `${event.pageY - 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "white"); // Reset the edge

      tooltip.style("visibility", "hidden");
    });
}

// -----------------------------
// Data Loading and Initialization
// -----------------------------

// Load and render the GeoJSON map data
d3.json("data/antarctica.geojson")
  .then(drawMap)
  .catch(error => console.error("Error loading map data:", error));

// Load and render the meteorite data for the heatmap
d3.json("data/meteorite_data.json")
  .then(createHeatmap)
  .catch(error => console.error("Error loading meteorite data:", error));
