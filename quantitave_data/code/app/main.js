// Import styles and libraries
import "./style.css";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import proj4 from "proj4"; // Assuming proj4 is available

// -----------------------------
// SVG Setup
// -----------------------------

// SVG dimensions are defined close to their usage
const WIDTH = 1920;
const HEIGHT = 1080;

// Function to initialize the main SVG element with specified dimensions and styles
function setupSVG() {
  // Create the main SVG element
  return d3.select("body")
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .style("background-color", "#6DCBD3")
    .style("box-shadow", "0 1 2 #DDDDDD"); // Consistent use of 0 instead of "0px"
}

// Create the main SVG
const svg = setupSVG();

// -----------------------------
// Menu Setup
// -----------------------------

// Function to create and configure the menu within the SVG
function setupMenu(svg) {
  // Menu layout constants defined close to their usage
  const MENU_WIDTH = 458;
  const MARGIN_LEFT = 30;
  const MARGIN_TOP = 30;

  // Create the menu group
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

  // Add menu title text
  const textX = MENU_WIDTH / 2 + MARGIN_LEFT;

  svgMenu.append("text")
    .attr("x", textX)
    .attr("y", 138)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("font-size", 64)
    .attr("font-family", "Anton")
    .attr("fill", "#3B6D8C")
    .text("Meteorites")
    .append("tspan")
    .attr("x", textX)
    .attr("dy", 72)
    .text("in Antarctica");

  // Add label for collected year
  svgMenu.append("text")
    .attr("x", 88)
    .attr("y", 369)
    .attr("font-size", 21)
    .style("font-weight", "bold")
    .attr("font-family", "Arial")
    .attr("fill", "#3B6D8C")
    .text("Collected Year");

  return svgMenu;
}

// Setup the menu
const svgMenu = setupMenu(svg);

// -----------------------------
// Histogram Setup
// -----------------------------

// Function to load meteorite data and render the histogram within the menu
function loadAndRenderHistogram(svgMenu) {
  // Define histogram layout constants close to their usage
  const HISTOGRAM_HEIGHT = 200;
  const HISTOGRAM_WIDTH = 450;
  const HISTOGRAM_MARGIN = { top: 20, right: 50, bottom: 50, left: 56 };
  const HISTOGRAM_Y_OFFSET = 400; // Y offset to place histogram below the title
  const BAR_PADDING = 5; // Padding between bars

  d3.json("data/meteorite_data.json").then(data => {
    // Extract the collection year from the data
    const years = data.map(d => d.collection_year);

    // Determine the minimum and maximum years
    const minYear = d3.min(years);
    const maxYear = d3.max(years);

    // Create X scale
    const x = d3.scaleLinear()
      .domain([minYear, maxYear]) // Input domain is the min and max year
      .range([0, HISTOGRAM_WIDTH - HISTOGRAM_MARGIN.left - HISTOGRAM_MARGIN.right]); // Adjust for margins

    // Create histogram generator with threshold every 2 years
    const histogramGenerator = d3.histogram()
      .value(d => d)
      .domain(x.domain())
      .thresholds(d3.range(minYear, maxYear + 5, 2));

    // Generate the histogram data
    const bins = histogramGenerator(years);

    // Create Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)]) // Input domain is 0 to the max frequency
      .nice()
      .range([HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom, 0]); // Adjust for margins

    // Append the histogram group to the menu
    const histogramGroup = svgMenu.append("g")
      .attr("transform", `translate(${30 + HISTOGRAM_MARGIN.left}, ${HISTOGRAM_Y_OFFSET + HISTOGRAM_MARGIN.top})`); // Correct arithmetic

    // Append the bars for the histogram
    histogramGroup.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0) + BAR_PADDING / 2)
      .attr("y", d => y(d.length))
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - BAR_PADDING))
      .attr("height", d => (HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom) - y(d.length))
      .attr("class", "bar")
      .style("fill", "#6DCBD3");

    // Create X axis with ticks every 10 years
    const xAxis = d3.axisBottom(x)
      .tickValues(d3.range(Math.ceil(minYear / 10) * 10, maxYear + 1, 10))
      .tickFormat(d3.format("d"))
      .tickSize(0)
      .tickPadding(8);

    // Append the X axis
    histogramGroup.append("g")
      .attr("transform", `translate(0, ${HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom})`)
      .call(xAxis)
      .select(".domain") // Select the axis line
      .attr("stroke", "#D7DAEB") // Set axis line color
      .attr("stroke-width", 3); // Set axis line thickness

    // Set font size and style for tick labels
    histogramGroup.selectAll(".tick text")
      .attr("dy", 15)
      .style("font-size", 15)
      .style("font-weight", "bold")
      .style("fill", "#3B6D8C");

    // Define color scale and formatter close to their usage
    const COLOR_SCALE = d3.scaleSequential(d3.interpolateRgb("#B4D2D9", "#0688A6"))
      .domain([0, d3.max(bins, d => d.length)]); // Updated domain based on data

    const FORMAT_COUNT = d3.format(".0s");
  }).catch(error => {
    console.error("Error loading the data:", error);
  });
}

// Load and render the histogram
loadAndRenderHistogram(svgMenu);

// -----------------------------
// Map Setup
// -----------------------------

// Function to initialize the map group within the SVG and set up projections
function setupMap(svg) {
  // Define projection settings close to their usage
  const STEREOGRAPHIC_CENTER = [135, -82.8628];
  const STEREOGRAPHIC_SCALE = 1500;
  const STEREOGRAPHIC_PRECISION = 0.1;

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

  return { svgMap, projection, path };
}

// Setup the map
const { svgMap, projection, path } = setupMap(svg);

// -----------------------------
// Utility Functions
// -----------------------------

// Function to transform coordinates from EPSG:3031 to WGS84
function transformCoordinates(coordinates) {
  return coordinates.map(coord => {
    const [x, y] = coord;
    const [lon, lat] = proj4("EPSG:3031", "WGS84", [x, y]);
    return [lon, lat];
  });
}

// Function to calculate the brightness of a hex color
function getBrightness(hexColor) {
  const rgb = d3.rgb(hexColor);
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114); // Standard brightness formula
}

// -----------------------------
// Rendering Functions
// -----------------------------

// Function to draw the Antarctica map using GeoJSON data
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

// Function to create a hexbin heatmap for meteorite data
function createHeatmap(pointData) {
  // Define hexbin settings close to their usage
  const HEXBIN_RADIUS = 25;
  const hexbin = d3Hexbin()
    .extent([[0, 0], [WIDTH, HEIGHT]])
    .radius(HEXBIN_RADIUS);

  // Convert data into projected coordinates
  const points = pointData.map(d => projection([+d.longitude, +d.latitude]));

  // Generate hexbin data
  const hexbinData = hexbin(points);

  // Define color scale close to its usage
  const COLOR_SCALE = d3.scaleSequential(d3.interpolateRgb("#B4D2D9", "#0688A6"))
    .domain([0, d3.max(hexbinData, d => d.length)]);

  // Define formatter close to its usage
  const FORMAT_COUNT = d3.format(".0s");

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
    .attr("d", hexbin.hexagon())
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

// Function to load and render the GeoJSON map data
function loadMapData() {
  d3.json("data/antarctica.geojson")
    .then(drawMap)
    .catch(error => console.error("Error loading map data:", error));
}

// Function to load and render the meteorite data for the heatmap
function loadHeatmapData() {
  d3.json("data/meteorite_data.json")
    .then(createHeatmap)
    .catch(error => console.error("Error loading meteorite data:", error));
}

// Function to initialize the visualization by loading data
function initializeVisualization() {
  loadMapData();
  loadHeatmapData();
}

// Start the visualization
initializeVisualization();
