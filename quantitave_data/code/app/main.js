// Import styles and libraries
import "./style.css";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import proj4 from "proj4"; // Assuming proj4 is available

// -----------------------------
// Constants and Configuration
// -----------------------------

const px = {
  WIDTH: 1920,
  HEIGHT: 1080,
  MENU_WIDTH: 458,
  MARGIN_LEFT: 30,
  MARGIN_TOP: 30,
  STEREOGRAPHIC_CENTER: [135, -82.8628],
  STEREOGRAPHIC_SCALE: 1500,
  STEREOGRAPHIC_PRECISION: 0.1,
  HEXBIN_RADIUS: 25,
  HISTOGRAM_HEIGHT: 250,
  HISTOGRAM_WIDTH: 450,
  HISTOGRAM_Y_OFFSET: 300,
  BAR_PADDING: 2,
  TOOLTIP_PADDING: 5,
  TOOLTIP_OFFSET_X: 10,
  TOOLTIP_OFFSET_Y: -10,
  MAP_TRANSLATE_X: 800,
  MAP_TRANSLATE_Y: 370,
  MAP_SCALE: 0.95,
};

const colorScale = d3.scaleSequential(d3.interpolateRgb("#B4D2D9", "#0688A6"))
  .domain([0, 0]); // Domain will be updated based on data

const formatCount = d3.format(".0s");

// -----------------------------
// SVG Setup
// -----------------------------

function setupSVG() {
  return d3.select("body")
    .append("svg")
    .attr("viewBox", `0 0 ${px.WIDTH} ${px.HEIGHT}`)
    .attr("width", px.WIDTH)
    .attr("height", px.HEIGHT)
    .style("background-color", "#6DCBD3")
    .style("box-shadow", "0px 1px 2px #DDDDDD");
}

const svg = setupSVG();

// -----------------------------
// Menu Setup
// -----------------------------

function setupMenu(svg) {
  const menuGroup = svg.append("g").attr("id", "menu");

  // Define drop shadow filter
  const defs = menuGroup.append("defs");
  defs.append("filter")
    .attr("id", "drop-shadow")
    .append("feDropShadow")
    .attr("dx", 10)
    .attr("dy", 10)
    .attr("stdDeviation", 0.5)
    .attr("flood-color", "white")
    .attr("flood-opacity", 0.5);

  // Menu background
  menuGroup.append("rect")
    .attr("id", "menu-background")
    .attr("x", px.MARGIN_LEFT)
    .attr("y", px.MARGIN_TOP)
    .attr("width", px.MENU_WIDTH)
    .attr("height", px.HEIGHT - 2 * px.MARGIN_TOP)
    .attr("fill", "#FEFEFE")
    .attr("rx", 66)
    .attr("ry", 66)
    .attr("opacity", 0.85)
    .attr("filter", "url(#drop-shadow)");

  // Menu text
  const textX = px.MENU_WIDTH / 2 + px.MARGIN_LEFT;
  const menuText = menuGroup.append("text")
    .attr("x", textX)
    .attr("y", 138)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("font-size", 64)
    .attr("font-family", "Anton")
    .attr("fill", "#3B6D8C")
    .text("Meteorites");

  menuText.append("tspan")
    .attr("x", textX)
    .attr("dy", "72")
    .text("in Antarctica");

  return menuGroup;
}

const svgMenu = setupMenu(svg);

// -----------------------------
// Histogram Setup
// -----------------------------

function setupHistogram(svgMenu) {
  const margin = { top: 20, right: 50, bottom: 50, left: 56 };
  const histogramGroup = svgMenu.append("g")
    .attr("transform", `translate(${px.MARGIN_LEFT + margin.left},${px.HISTOGRAM_Y_OFFSET + margin.top})`);

  return { histogramGroup, margin };
}

const { histogramGroup, margin } = setupHistogram(svgMenu);

// -----------------------------
// Utility Functions
// -----------------------------

function transformCoordinates(coordinates) {
  return coordinates.map(coord => {
    const [x, y] = coord;
    const [lon, lat] = proj4("EPSG:3031", "WGS84", [x, y]);
    return [lon, lat];
  });
}

function getBrightness(hexColor) {
  const rgb = d3.rgb(hexColor);
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114); // Standard brightness formula
}

// -----------------------------
// Map Setup
// -----------------------------

function setupMap(svg) {
  const svgMap = svg.append("g")
    .attr("id", "map")
    .attr("transform", `translate(${px.MAP_TRANSLATE_X}, ${px.MAP_TRANSLATE_Y}) scale(${px.MAP_SCALE})`);

  // Define the projection for D3 (Stereographic)
  const projection = d3.geoStereographic()
    .center(px.STEREOGRAPHIC_CENTER)
    .scale(px.STEREOGRAPHIC_SCALE)
    .precision(px.STEREOGRAPHIC_PRECISION);

  const path = d3.geoPath().projection(projection);

  // Define EPSG:3031 projection using Proj4
  proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs");

  return { svgMap, projection, path };
}

const { svgMap, projection, path } = setupMap(svg);

// -----------------------------
// Rendering Functions
// -----------------------------

function drawMap(mapData, svgMap, path) {
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

function createHeatmap(pointData, projection, svgMap) {
  const points = pointData.map(d => projection([+d.longitude, +d.latitude]));

  const hexbin = d3Hexbin()
    .extent([[0, 0], [px.WIDTH, px.HEIGHT]])
    .radius(px.HEXBIN_RADIUS);

  const hexbinData = hexbin(points);

  const maxCount = d3.max(hexbinData, d => d.length);
  colorScale.domain([0, maxCount]);

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
    .attr("fill", d => colorScale(d.length))
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  hexGroup.append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y + 7) // Center text vertically
    .attr("text-anchor", "middle")
    .attr("font-size", 17.5)
    .attr("font-weight", "bold")
    .attr("fill", d => {
      const hexColor = colorScale(d.length);
      const brightness = getBrightness(hexColor);
      return brightness < 150 ? "white" : "#343434";
    })
    .style("pointer-events", "none")
    .text(d => formatCount(d.length));

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", `${px.TOOLTIP_PADDING}px`)
    .style("background", "rgba(255, 255, 255, 0.8)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

  hexGroup.select("path")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("stroke", "black");
      tooltip.style("visibility", "visible")
        .text(`Number of Meteorites: ${d.length}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", `${event.pageY + px.TOOLTIP_OFFSET_Y}px`)
        .style("left", `${event.pageX + px.TOOLTIP_OFFSET_X}px`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke", "white");
      tooltip.style("visibility", "hidden");
    });
}

// -----------------------------
// Histogram Rendering
// -----------------------------

function renderHistogram(data, histogramGroup, margin) {
  const years = data.map(d => d.collection_year);
  const minYear = d3.min(years);
  const maxYear = d3.max(years);

  const xScale = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([0, px.HISTOGRAM_WIDTH - margin.left - margin.right]);

  const histogramGenerator = d3.histogram()
    .value(d => d)
    .domain(xScale.domain())
    .thresholds(d3.range(minYear, maxYear + 5, 2));

  const bins = histogramGenerator(years);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .nice()
    .range([px.HISTOGRAM_HEIGHT - margin.top - margin.bottom, 0]);

  // Draw bars
  histogramGroup.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.x0) + px.BAR_PADDING / 2)
    .attr("y", d => yScale(d.length))
    .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - px.BAR_PADDING))
    .attr("height", d => (px.HISTOGRAM_HEIGHT - margin.top - margin.bottom) - yScale(d.length))
    .attr("class", "bar")
    .style("fill", "#6DCBD3");

  // X Axis
  const xAxis = d3.axisBottom(xScale)
    .tickValues(d3.range(Math.ceil(minYear / 10) * 10, maxYear + 1, 10))
    .tickFormat(d3.format("d"))
    .tickSize(0)
    .tickPadding(8);

  histogramGroup.append("g")
    .attr("transform", `translate(0,${px.HISTOGRAM_HEIGHT - margin.top - margin.bottom})`)
    .call(xAxis)
    .select(".domain")
    .attr("stroke", "#D7DAEB")
    .attr("stroke-width", 3);

  histogramGroup.selectAll(".tick text")
    .attr("dy", 15)
    .style("font-size", 15)
    .style("font-weight", "bold")
    .style("fill", "#3B6D8C");
}

// -----------------------------
// Data Loading and Initialization
// -----------------------------

function initialize() {
  // Load and render histogram
  d3.json("data/meteorite_data.json")
    .then(data => {
      renderHistogram(data, histogramGroup, margin);
    })
    .catch(error => {
      console.error("Error loading the meteorite data for histogram:", error);
    });

  // Load and render map
  d3.json("data/antarctica.geojson")
    .then(mapData => {
      drawMap(mapData, svgMap, path);
    })
    .catch(error => {
      console.error("Error loading map data:", error);
    });

  // Load and render heatmap
  d3.json("data/meteorite_data.json")
    .then(data => {
      createHeatmap(data, projection, svgMap);
    })
    .catch(error => {
      console.error("Error loading meteorite data for heatmap:", error);
    });
}

initialize();
