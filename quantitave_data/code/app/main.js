// Import styles and libraries
import "./style.css";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import proj4 from "proj4";

// ---------------------------------
// SVG Setup
// ---------------------------------

// Define SVG dimensions
const WIDTH = 1920;
const HEIGHT = 1080;

// Initialize the main SVG element
function setupSVG() {
  return d3.select("body")
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("background-color", "#6DCBD3")
    .style("box-shadow", "0 1px 2px #DDDDDD");
}

const svg = setupSVG();

// ---------------------------------
// Menu Setup
// ---------------------------------

// Create and configure the menu within the SVG
function setupMenu(svg) {
  const MENU_WIDTH = 458;
  const MARGIN_LEFT = 30;
  const MARGIN_TOP = 30;

  const svgMenu = svg.append("g").attr("id", "menu");

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
    .attr("y", 380)
    .attr("font-size", 18)
    .style("font-weight", "bold")
    .attr("font-family", "Arial")
    .attr("fill", "#3B6D8C")
    .text("Collected Year");

  // Add label for weight histogram
  svgMenu.append("text")
    .attr("x", 88)
    .attr("y", 655)
    .attr("font-size", 18)
    .style("font-weight", "bold")
    .attr("font-family", "Arial")
    .attr("fill", "#3B6D8C")
    .text("Weight");

  return svgMenu;
}

const svgMenu = setupMenu(svg);

// ---------------------------------
// Histograms Setup
// ---------------------------------

// Load meteorite data and render the histograms within the menu
function loadAndRenderHistogram(svgMenu) {
  const HISTOGRAM_HEIGHT = 200;
  const HISTOGRAM_WIDTH = 450;
  const HISTOGRAM_MARGIN = { top: 20, right: 50, bottom: 50, left: 56 };
  const COLLECTED_YEAR_HISTOGRAM_Y_OFFSET = 380;
  const WEIGHT_HISTOGRAM_Y_OFFSET = 650;
  const BAR_PADDING = 5;

  d3.json("data/meteorite_data.json").then(data => {

    // -----------------------------
    // Histogram for Collected Year
    // -----------------------------

    // Extract data and determine min/max
    const years = data.map(d => d.collection_year);
    const minYear = d3.min(years);
    const maxYear = d3.max(years);

    // Create scales
    const collectedYearX = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, HISTOGRAM_WIDTH - HISTOGRAM_MARGIN.left - HISTOGRAM_MARGIN.right]);

    const collectedYearGenerator = d3.histogram()
      .value(d => d)
      .domain(collectedYearX.domain())
      .thresholds(d3.range(minYear, maxYear + 5, 2));

    const collectedYearBins = collectedYearGenerator(years);

    const collectedYearY = d3.scaleLinear()
      .domain([0, d3.max(collectedYearBins, d => d.length)])
      .nice()
      .range([HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom, 0]);

    // Append histogram group
    const collectedYearGroup = svgMenu.append("g")
      .attr("transform", `translate(${30 + HISTOGRAM_MARGIN.left}, ${COLLECTED_YEAR_HISTOGRAM_Y_OFFSET + HISTOGRAM_MARGIN.top})`);

    // Append bars
    collectedYearGroup.selectAll("rect")
      .data(collectedYearBins)
      .enter()
      .append("rect")
      .attr("x", d => collectedYearX(d.x0) + BAR_PADDING / 2)
      .attr("y", d => collectedYearY(d.length))
      .attr("width", d => Math.max(0, collectedYearX(d.x1) - collectedYearX(d.x0) - BAR_PADDING))
      .attr("height", d => (HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom) - collectedYearY(d.length))
      .attr("class", "bar")
      .style("fill", "#6DCBD3");

    // Create and append X axis
    const collectedYearXAxis = d3.axisBottom(collectedYearX)
      .tickValues(d3.range(Math.ceil(minYear / 10) * 10, maxYear + 1, 10))
      .tickFormat(d3.format("d"))
      .tickSize(0)
      .tickPadding(8);

    collectedYearGroup.append("g")
      .attr("transform", `translate(0, ${HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom})`)
      .call(collectedYearXAxis)
      .select(".domain")
      .attr("stroke", "#D7DAEB")
      .attr("stroke-width", 3);

    // Style tick labels
    collectedYearGroup.selectAll(".tick text")
      .attr("dy", 15)
      .style("font-size", 15)
      .style("font-weight", "bold")
      .style("fill", "#3B6D8C");

    // Create tooltip
    const collectedYearTooltip = d3.select("body").append("div")
      .attr("class", "tooltip_collected_year")
      .style("position", "absolute")
      .style("padding", "5px")
      .style("background", "rgba(255, 255, 255)")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    // Add tooltip events
    collectedYearGroup.selectAll("rect")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black");
        collectedYearTooltip.style("visibility", "visible")
          .html(`<strong>Collected Year:</strong> ${d.x0} - ${d.x1 - 1}<br><strong>Number of Meteorites:</strong> ${d.length}`);
      })
      .on("mousemove", function (event) {
        collectedYearTooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
        collectedYearTooltip.style("visibility", "hidden");
      });

    // -----------------------------
    // Histogram for Weight
    // -----------------------------

    // Extract data and determine min/max
    const weights = data.map(d => +d.weight_gram).filter(d => !isNaN(d));
    const maxWeight = d3.max(weights);

    // Define bin thresholds and create histogram generator
    const binThresholds = [
      0, 0.1, 1, 5, 10, 25, 50, 75, 100,
      250, 500, 750, 1000, 10000, 100000, maxWeight + 1
    ];

    const weightGenerator = d3.histogram()
      .value(d => d)
      .domain([0, maxWeight + 1])
      .thresholds(binThresholds);

    const weightBins = weightGenerator(weights).filter(d => d.length > 0);

    // Create bin labels and scales
    const binLabels = weightBins.map(d => {
      const min = d.x0;
      const max = d.x1;
      if (max === maxWeight + 1) return `${(min / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}kg <=`;
      else if (max >= 1000) return `< ${(max / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}kg`;
      else return `< ${max.toLocaleString()}g`;
    });

    weightBins.forEach((d, i) => {
      d.binLabel = binLabels[i];
    });

    const weightX = d3.scaleBand()
      .domain(binLabels)
      .range([0, HISTOGRAM_WIDTH - HISTOGRAM_MARGIN.left - HISTOGRAM_MARGIN.right])
      .padding(0.1);

    const maxBinCount = d3.max(weightBins, d => d.length);

    const weightY = d3.scaleLinear()
      .domain([0, maxBinCount])
      .nice()
      .range([HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom, 0]);

    // Append histogram group
    const weightGroup = svgMenu.append("g")
      .attr("transform", `translate(${30 + HISTOGRAM_MARGIN.left}, ${WEIGHT_HISTOGRAM_Y_OFFSET + HISTOGRAM_MARGIN.top})`);

    // Append bars
    const MIN_BAR_HEIGHT = 2;
    weightGroup.selectAll("rect")
      .data(weightBins)
      .enter()
      .append("rect")
      .attr("x", d => weightX(d.binLabel) + BAR_PADDING)
      .attr("y", d => {
        const barHeight = (HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom) - weightY(d.length);
        return weightY(d.length) - (barHeight < MIN_BAR_HEIGHT ? (MIN_BAR_HEIGHT - barHeight) : 0);
      })
      .attr("width", weightX.bandwidth() - BAR_PADDING)
      .attr("height", d => {
        const barHeight = (HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom) - weightY(d.length);
        return barHeight < MIN_BAR_HEIGHT ? MIN_BAR_HEIGHT : barHeight;
      })
      .attr("class", "bar")
      .style("fill", "#6DCBD3");

    // Create and append X axis
    const weightXAxis = d3.axisBottom(weightX)
      .tickFormat(d => d)
      .tickSize(0)
      .tickPadding(8);

    weightGroup.append("g")
      .attr("transform", `translate(0, ${HISTOGRAM_HEIGHT - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom})`)
      .call(weightXAxis)
      .select(".domain")
      .attr("stroke", "#D7DAEB")
      .attr("stroke-width", 3);

    // Style tick labels
    weightGroup.selectAll(".tick text")
      .attr("transform", "rotate(-60)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .style("font-size", 12)
      .style("font-weight", "bold")
      .style("fill", "#3B6D8C");

    // Create tooltip
    const weightTooltip = d3.select("body").append("div")
      .attr("class", "tooltip_weight")
      .style("position", "absolute")
      .style("padding", "5px")
      .style("background", "rgba(255, 255, 255)")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    // Add tooltip events
    weightGroup.selectAll("rect")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black");
        let weightRange;
        if (d.x1 === maxWeight + 1) {
          weightRange = `≥ ${(d.x0 / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}kg`;
        } else if (d.x1 >= 1000) {
          weightRange = `${(d.x0 / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}kg - ${(d.x1 / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}kg`;
        } else {
          weightRange = `${d.x0.toLocaleString()}g - ${d.x1.toLocaleString()}g`;
        }

        weightTooltip.style("visibility", "visible")
          .html(`<strong>Weight:</strong> ${weightRange}<br><strong>Number of Meteorites:</strong> ${d.length}`);
      })
      .on("mousemove", function (event) {
        weightTooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none");
        weightTooltip.style("visibility", "hidden");
      });

  }).catch(error => {
    console.error("Error loading the data:", error);
  });
}

loadAndRenderHistogram(svgMenu);

// ---------------------------------
// Map Setup
// ---------------------------------

// Initialize the map group within the SVG and set up projections
function setupMap(svg) {
  const STEREOGRAPHIC_CENTER = [135, -82.8628];
  const STEREOGRAPHIC_SCALE = 1500;
  const STEREOGRAPHIC_PRECISION = 0.1;

  const svgMap = svg.append("g")
    .attr("id", "map")
    .attr("transform", "translate(800, 370) scale(0.95)");

  const projection = d3.geoStereographic()
    .center(STEREOGRAPHIC_CENTER)
    .scale(STEREOGRAPHIC_SCALE)
    .precision(STEREOGRAPHIC_PRECISION);

  const path = d3.geoPath().projection(projection);

  proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs");

  return { svgMap, projection, path };
}

const { svgMap, projection, path } = setupMap(svg);

// ---------------------------------
// Utility Functions
// ---------------------------------

// Transform coordinates from EPSG:3031 to WGS84
function transformCoordinates(coordinates) {
  return coordinates.map(coord => {
    const [x, y] = coord;
    const [lon, lat] = proj4("EPSG:3031", "WGS84", [x, y]);
    return [lon, lat];
  });
}

// Calculate the brightness of a hex color
function getBrightness(hexColor) {
  const rgb = d3.rgb(hexColor);
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
}

// ---------------------------------
// Rendering Functions
// ---------------------------------

// Draw the Antarctica map using GeoJSON data
function drawMap(mapData) {
  mapData.features.forEach(feature => {
    feature.geometry.coordinates = feature.geometry.coordinates.map(transformCoordinates);
  });

  svgMap.selectAll("path.land")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("fill", "white")
    .attr("class", "land")
    .attr("d", path);
}

// Create a hexbin heatmap for meteorite data
function createHeatmap(pointData) {
  const HEXBIN_RADIUS = 25;
  const hexbin = d3Hexbin()
    .extent([[0, 0], [WIDTH, HEIGHT]])
    .radius(HEXBIN_RADIUS);

  const points = pointData.map(d => projection([+d.longitude, +d.latitude]));

  const hexbinData = hexbin(points);

  const COLOR_SCALE = d3.scaleSequential(d3.interpolateRgb("#B4D2D9", "#0688A6"))
    .domain([0, d3.max(hexbinData, d => d.length)]);

  const FORMAT_COUNT = d3.format(".0s");

  const hexGroup = svgMap.append("g")
    .attr("class", "hexagon")
    .selectAll("g")
    .data(hexbinData)
    .enter()
    .append("g")
    .attr("class", "hexbin");

  hexGroup.append("path")
    .attr("d", hexbin.hexagon())
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .attr("fill", d => COLOR_SCALE(d.length))
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  hexGroup.append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y + 7)
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

  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_hex")
    .style("position", "absolute")
    .style("padding", "5px")
    .style("background", "rgba(255, 255, 255)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

  // Add tooltip events
  hexGroup.select("path")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "black");
      tooltip.style("visibility", "visible")
        .text(`Number of Meteorites: ${d.length}`);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", `${event.pageY - 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "white");
      tooltip.style("visibility", "hidden");
    });
}

// ---------------------------------
// Data Loading and Initialization
// ---------------------------------

// Load and render the GeoJSON map data
function loadMapData() {
  d3.json("data/antarctica.geojson")
    .then(drawMap)
    .catch(error => console.error("Error loading map data:", error));
}

// Load and render the meteorite data for the heatmap
function loadHeatmapData() {
  d3.json("data/meteorite_data.json")
    .then(createHeatmap)
    .catch(error => console.error("Error loading meteorite data:", error));
}

// Initialize the visualization by loading data
function initializeVisualization() {
  loadMapData();
  loadAndRenderHistogram(svgMenu);
  loadHeatmapData();
}

// Start the visualization
initializeVisualization();
