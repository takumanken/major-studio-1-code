// ------------------------------
// Constants
// ------------------------------

const body = d3.select("body").style("margin", "0").style("font-family", "Raleway");

// State
let state = {
  descriptionDivOpacity: 0,
  imageDivOpacity: 0,
  imageDivAntarcticaHeatmapOpacity: 0,
  imageDivContentsOpacity: 0,
  imageDivBIABaseIllustrationOpacity: 0,
  backGroundColor: "#FFFFFF",
};

// Color
const baseColor = "#36B5C8";
const whiteColor = "#FFFFFF";
const blackColor = "#000000";

// Map Projection
const projection = d3.geoStereographic().center([0, -90]).scale(1150);
const path = d3.geoPath().projection(projection);

// opacity Threshold
const fadeInOutThreshold = 0.35;

// Window Size
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const antarcticaMapSvgWidth = windowWidth * 0.6;
const antarcticaMapSvgHeight = windowHeight * 0.9;
const antarcticaMapTranslateY = antarcticaMapSvgHeight * 0.1;

// ------------------------------
// Data Load functions
// ------------------------------

// Load Data
async function loadAntarcticaGeoJSON() {
  return d3.json("./data/antarctica_wgs84.geojson");
}

async function loadAttributedLocationData() {
  return await d3.json("./data/attributed_locations.json");
}

async function loadAntarcticaMeteoritesData() {
  return await d3.json("./data/antarctica_meteorites.json");
}

async function loadElevationData() {
  return await d3.json("./data/antarctica_elevation.geojson");
}

async function getBiaMapData() {
  return await d3.json("./data/bia_wgs84.geojson");
}

// ------------------------------
// Structuring Functions
// ------------------------------

function buildScrollyTellingDiv() {
  const scrollyTellingDiv = body
    .append("div")
    .attr("id", "scrolly_telling_div")
    .style("display", "flex")
    .style("flex-direction", "rows")
    .style("justify-content", "center")
    .style("width", "100vw");

  const marginTop = "100px";
  const sectionWidth = "100vw";

  const scrollDiv = scrollyTellingDiv
    .append("div")
    .attr("id", "scroll_div")
    .style("width", 0)
    .style("height", "100%")
    .style("margin-top", marginTop)
    .style("display", "flex")
    .style("flex-direction", "column");

  const stickyContainer = scrollyTellingDiv
    .append("div")
    .attr("id", "sticky_container")
    .style("width", sectionWidth)
    .style("height", "100vh")
    .style("position", "sticky")
    .style("top", "0px");

  const TextDiv = stickyContainer.append("div").attr("id", "text_div");

  const DescriptionDiv = TextDiv.append("div")
    .attr("id", "desc_div")
    .style("font-weight", "400")
    .style("font-size", "1.6rem");

  const imageDiv = stickyContainer.append("div").attr("id", "image_div");

  const scrollyTellingElements = [
    "si_stats",
    "collected_location",
    "antarctica_climate",
    "antarctica_visual_contrast",
    "collection_spot",
    "elevation",
    "bia",
    "bia_picture",
    "bia_illustration",
    "ALH84001",
    "global_warming",
    "last_comment",
    "credit",
  ];

  scrollyTellingElements.forEach((d, i) => {
    let scrollDivHeight = "200vh";
    if (d === "credit") {
      scrollDivHeight = "400vh";
    }
    scrollDiv
      .append("div")
      .attr("class", "step")
      .attr("id", d + "_div")
      .style("height", scrollDivHeight)
      .style("width", "1px");
  });
  return [DescriptionDiv, imageDiv];
}

function drawAntarcticaMap(div, antarcticaGeoJSON) {
  const antarcticaMapSVG = div
    .append("svg")
    .attr("id", "map")
    .attr("viewBox", `0 0 ${antarcticaMapSvgWidth} ${antarcticaMapSvgHeight}`)
    .style("height", antarcticaMapSvgHeight)
    .style("width", antarcticaMapSvgWidth);

  // SVG Group for Map
  const svgMap = antarcticaMapSVG
    .append("g")
    .attr("class", `antarcticaMap`)
    .attr("transform", `translate(0, ${antarcticaMapTranslateY})`);

  svgMap
    .selectAll("path.land")
    .data(antarcticaGeoJSON.features)
    .enter()
    .append("path")
    .attr("class", "land")
    .attr("d", path)
    .attr("fill", "white");

  return antarcticaMapSVG;
}

function addCollectionSpotHeatmap(svg, antarcticaMeteoritesData) {
  // Hexbin Setup
  const hexbin = d3
    .hexbin()
    .radius(7.5)
    .x((d) => d.x)
    .y((d) => d.y);

  antarcticaMeteoritesData.forEach((record) => {
    const [x, y] = projection([record.longitude, record.latitude]);
    record.x = x;
    record.y = y;
    record.value = 1;
  });

  // Generate hexbin data
  const bins = hexbin(antarcticaMeteoritesData);

  // Create Tooltip
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "heatmap-tooltip")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "rgba(255, 255, 255, 0.8)")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "1rem")
      .style("visibility", "hidden");
  }

  // Draw Hexbin Heatmap
  const heatmapGroup = svg
    .append("g")
    .attr("id", "heatmap")
    .style("opacity", state.imageDivAntarcticaHeatmapOpacity)
    .attr("transform", `translate(0, ${antarcticaMapTranslateY})`);

  heatmapGroup
    .selectAll("path")
    .data(bins)
    .enter()
    .append("path")
    .attr("d", (d) => hexbin.hexagon())
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .attr("fill", (d) => {
      if (d.length > 1000) {
        return "#008CA0";
      } else if (d.length > 500) {
        return "#3AC7DB";
      } else if (d.length > 0) {
        return "#C9F8FF";
      }
    })
    .attr("stroke", "gray")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible").html(`<strong># of Meteorites:</strong> ${d.length}`);
      d3.select(this).attr("stroke-width", 1).attr("stroke", "#000");
    })
    .on("mousemove", function (event) {
      tooltip.style("top", event.pageY + 15 + "px").style("left", event.pageX + 15 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke-width", 0.5).attr("stroke", "gray");
    });
}
function drawElevationMap(AntarcticaMapSVG, elevationData) {
  // Create Tooltip
  let tooltip = d3.select("body").select("#elevation-tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "elevation-tooltip")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "rgba(255, 255, 255, 0.8)")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "1rem")
      .style("visibility", "hidden");
  }

  AntarcticaMapSVG.append("g")
    .attr("class", "imageDivContents")
    .selectAll("path.land")
    .data(elevationData.features)
    .enter()
    .append("path")
    .attr("class", "land")
    .attr("d", path)
    .style("fill", (d) => {
      const elevation = d.properties.elevation;
      if (elevation === 0) {
        return "#FFFFFF";
      } else if (elevation === 1000) {
        return "#E5E5E5";
      } else if (elevation === 2000) {
        return "#D5D5D5";
      } else if (elevation === 3000) {
        return "#C5C5C5";
      } else if (elevation === 3500) {
        return "#BDBDBD";
      } else if (elevation === 4000) {
        return "#B5B5B5";
      }
    })
    .attr("transform", `translate(0, ${antarcticaMapTranslateY})`)
    .on("mouseover", function (event, d) {
      const elevation = d.properties.elevation;
      tooltip.style("visibility", "visible").html(`<strong>Elevation:</strong> ${elevation} meters`);
      d3.select(this).style("stroke", "lightgray").style("stroke-width", 1);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", event.pageY + 15 + "px").style("left", event.pageX + 15 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).style("stroke", "none");
    });
}

// Cleanup Function
function removeExistingContents(descriptionDiv, imageDiv) {
  descriptionDiv.html("");
  imageDiv.html("");
}

// ------------------------------
// Title Section
// ------------------------------

function drawTitleSection() {
  const titleDiv = body
    .append("div")
    .attr("id", "title_div")
    .attr("class", "step")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("height", "100vh")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("position", "relative")
    .style("background-image", "linear-gradient(#76CDD9, #FFFFFF)")
    .style("font-family", "Inria Sans");

  titleDiv
    .append("h1")
    .html("WHY ARE METEORITES<br>FOUND IN ANTARCTICA?")
    .style("font-size", "90px")
    .style("color", "#123E42")
    .style("font-weight", "700")
    .style("width", "1200px")
    .style("text-align", "center")
    .style("margin", 0);

  titleDiv
    .append("p")
    .html("DISCOVER THEIR HIDDEN SECRETS … AND THE LOOMING THREAT")
    .style("font-size", "2rem")
    .style("color", "#2A99A0")
    .style("font-weight", "400")
    .style("width", "1200px")
    .style("text-align", "center")
    .style("margin", "20px 0");

  titleDiv
    .append("img")
    .attr("src", "data/meteorites.png")
    .style("position", "absolute")
    .style("top", "0px")
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("width", "70%")
    .style("height", "auto");

  titleDiv
    .append("img")
    .attr("src", "data/antarctica_mountains.png")
    .style("position", "absolute")
    .style("bottom", "0px")
    .style("left", "10px")
    .style("width", "50%")
    .style("height", "auto");

  titleDiv
    .append("img")
    .attr("src", "data/scroll_down.png")
    .style("position", "absolute")
    .style("bottom", "50px")
    .style("left", "50%")
    .style("width", "30px")
    .style("height", "auto")
    .style("animation", "bounce 2s infinite");
}

// ------------------------------
// Smithsonian Collection Stats
// ------------------------------

function drawSiStats(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);
  body.style("background-color", whiteColor);
  descriptionDiv.style("color", blackColor);

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "27%")
    .style("width", "60%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("position", "fixed")
    .style("top", "45%")
    .style("left", "20%")
    .style("height", "10%")
    .style("width", "auto");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "<b>The Smithsonian Institution houses a world-class meteorite collection.</b><br>This collection, preserved in the National Museum of Natural History, includes over 55,000 specimens and more than 20,000 distinct meteorites."
    )
    .style("margin", "0");

  imageDiv.append("img").attr("src", "./data/smithsonian_logo.png").style("width", "100%").style("height", "100%");
}

// ------------------------------
// Collected Location
// ------------------------------

function drawCollectedLocation(descriptionDiv, imageDiv, AttributedLocationData) {
  removeExistingContents(descriptionDiv, imageDiv);
  body.style("background-color", whiteColor);
  descriptionDiv.style("color", blackColor);

  // Positioning
  descriptionDiv.style("position", "fixed").style("top", "18%").style("left", "25%").style("width", "50%");
  imageDiv
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("position", "fixed")
    .style("top", "35%")
    .style("left", "20%")
    .style("width", "60%")
    .style("height", "100%");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "Where are these meteorites collected?<br>The Smithsonian's collection shows that <b>71% of its meteorites come from Antarctica</b>—a proportion much higher than any other continent."
    )
    .style("margin", 0);

  // Chart
  imageDiv.style("flex-direction", "column");

  const attrLocationChartDiv = imageDiv.append("div");

  attrLocationChartDiv.append("p").style("font-weight", 200).text("Attributed Locations");

  const attrLocationChartSVG = imageDiv.append("svg").style("width", "100%").style("height", "100%");

  const attrLocationChartWidth = windowWidth / 3.5;
  const attrLocationChartHeight = windowHeight / 2.2;
  const attrLocationChartPadding = { left: windowWidth / 6 };

  // Define X axis Scale
  const attrLocationChartXScale = d3
    .scaleLinear()
    .domain([0, d3.max(AttributedLocationData.map((d) => d[1].length_ratio))])
    .range([0, attrLocationChartWidth]);

  // Define Y axis Scale
  const attrLocationChartYScale = d3
    .scaleBand()
    .range([0, attrLocationChartHeight])
    .domain(AttributedLocationData.map((d) => d[0]))
    .padding(0.65);

  // Draw Y axis
  const yAxis = attrLocationChartSVG
    .append("g")
    .call(d3.axisLeft(attrLocationChartYScale).tickPadding(15).tickSize(0))
    .style("font-size", "1rem")
    .style("font-weight", 100)
    .attr("transform", `translate(${attrLocationChartPadding.left}, 0)`);

  // Format Y Axis
  yAxis.select(".domain").attr("stroke", "#E8E8E8").attr("stroke-width", "2");

  // Draw Bar
  attrLocationChartSVG
    .selectAll("rect")
    .data(AttributedLocationData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => attrLocationChartYScale(d[0]))
    .attr("width", (d) => attrLocationChartXScale(d[1].length_ratio))
    .attr("height", attrLocationChartYScale.bandwidth())
    .attr("fill", (d) => (d[0] === "Antarctica" ? baseColor : "#DBDBDB"))
    .attr("rx", 10)
    .attr("transform", `translate(${attrLocationChartPadding.left}, 0)`);

  // Draw Chart Label
  attrLocationChartSVG
    .selectAll(".text")
    .data(AttributedLocationData)
    .enter()
    .append("text")
    .text((d) => Math.round(d[1].length_ratio * 100) + "%")
    .attr("x", (d) => attrLocationChartXScale(d[1].length_ratio) + 15)
    .attr("y", (d) => attrLocationChartYScale(d[0]) + 18)
    .attr("fill", (d) => (d[0] === "Antarctica" ? baseColor : "#858585"))
    .style("font-size", "1.5rem")
    .style("font-weight", 200)
    .attr("transform", `translate(${attrLocationChartPadding.left}, 0)`);
}

// ------------------------------
// Antarctica's Climate
// ------------------------------

function drawAntarcticaClimate(descriptionDiv, imageDiv, antarcticaGeoJSON) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", baseColor);
  descriptionDiv.style("color", "white");
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "5%")
    .style("width", "32%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("display", "flex")
    .style("top", "7%")
    .style("left", "20%")
    .style("width", "90%")
    .style("height", "90%");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "Why Antarctica?<br><br><b>The first reason is the climate.</b> The extremely cold temperatures slow weathering, while the dry conditions limit chemical alteration. Some meteorites found in Antarctica fell to Earth more than a million years ago."
    )
    .style("margin", 0);

  // Image Div Setup
  const climateAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);
  const climateText = climateAntarcticaMapSVG.append("g").attr("class", "imageDivContents");

  const xHighest = 375;
  const xCoast = 650;
  const y = 315;

  climateText
    .append("text")
    .text("Avg. along the coast")
    .attr("x", xCoast)
    .attr("y", y)
    .style("fill", baseColor)
    .style("font-weight", 200)
    .style("text-anchor", "center")
    .style("font-size", "1.3rem");

  climateText
    .append("text")
    .text("-10 °C")
    .attr("x", xCoast)
    .attr("y", y + 70)
    .style("fill", baseColor)
    .style("font-size", "4.6rem")
    .style("font-weight", 200)
    .style("text-anchor", "center");

  climateText
    .append("text")
    .text("Avg. at the highest parts")
    .attr("x", xHighest)
    .attr("y", y)
    .style("fill", baseColor)
    .style("font-weight", 200)
    .style("font-size", "1.3rem")
    .style("text-anchor", "center");

  climateText
    .append("text")
    .text("-70 °C")
    .attr("x", xHighest)
    .attr("y", y + 70)
    .style("fill", baseColor)
    .style("font-size", "4.75rem")
    .style("font-weight", 200)
    .style("text-anchor", "center");
}

// ------------------------------
// Visual Contrast
// ------------------------------

function drawVisualContrast(descriptionDiv, imageDiv, antarcticaGeoJSON) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", baseColor);
  descriptionDiv.style("color", "white");
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "5%")
    .style("width", "32%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("display", "flex")
    .style("top", "7%")
    .style("left", "20%")
    .style("width", "90%")
    .style("height", "90%");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "<b>Another reason is the clear visual contrast.</b><br> Most meteorites are dark in color, making them easier to spot on the white ice surface than on other surfaces like vegetation, gravel, or urban areas."
    )
    .style("margin", 0);

  const visContrastAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);

  const meteoriteCoordinates = [
    { x: 270, y: 350 },
    { x: 460, y: 110 },
    { x: 460, y: 320 },
    { x: 640, y: 210 },
    { x: 640, y: 420 },
    { x: 820, y: 310 },
    { x: 820, y: 520 },
    { x: 730, y: 620 },
  ];

  visContrastAntarcticaMapSVG
    .append("g")
    .attr("class", "imageDivContents")
    .selectAll("image")
    .data(meteoriteCoordinates)
    .enter()
    .append("image")
    .attr("id", "meteorite_images")
    .attr("xlink:href", "./data/meteorite.png")
    .attr("width", 30)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);
}

// ------------------------------
// Collection Spot
// ------------------------------

function drawCollectionSpot(descriptionDiv, imageDiv, antarcticaGeoJSON, antarcticaMeteoritesData) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", baseColor);
  descriptionDiv.style("color", "white");
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "5%")
    .style("width", "32%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("display", "flex")
    .style("top", "7%")
    .style("left", "20%")
    .style("width", "90%")
    .style("height", "90%");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "So, can meteorites be found anywhere in Antarctica?<br><br>Not really. According to Smithsonian data, <b>meteorite collection sites are primarily concentrated in the highlighted areas on the map.</b>"
    )
    .style("margin", 0);

  // Draw Hexbin on Map
  const correctionSpotAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);
  addCollectionSpotHeatmap(correctionSpotAntarcticaMapSVG, antarcticaMeteoritesData);
}

// ------------------------------
// Elevation
// ------------------------------

function drawElevation(descriptionDiv, imageDiv, antarcticaGeoJSON, antarcticaMeteoritesData, elevationData) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", baseColor);
  descriptionDiv.style("color", "white");
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "5%")
    .style("width", "30%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("display", "flex")
    .style("top", "7%")
    .style("left", "20%")
    .style("width", "90%")
    .style("height", "90%");

  // Description
  descriptionDiv
    .append("p")
    .html(
      "What is special about these areas?<br><br><b>One reason is that they are relatively low-elevation regions.</b> This means they have less snow accumulation compared to higher elevations, leaving meteorites on the surface more often."
    )
    .style("margin", 0);

  const elevationAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);
  drawElevationMap(elevationAntarcticaMapSVG, elevationData);
  addCollectionSpotHeatmap(elevationAntarcticaMapSVG, antarcticaMeteoritesData);
}

// ------------------------------
// Blue Ice Area
// ------------------------------
function drawBlueIceAreas(descriptionDiv, imageDiv, antarcticaGeoJSON, biaMapData) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", baseColor);
  descriptionDiv.style("color", "white");
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "5%")
    .style("width", "30%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv
    .style("display", "flex")
    .style("top", "7%")
    .style("left", "20%")
    .style("width", "90%")
    .style("height", "90%");

  descriptionDiv
    .append("p")
    .html(
      "However, there's another crucial feature that makes these areas unique:<br><br><b>Blue Ice Areas</b> — special regions that occupy only 1% of Antarctica's vast continent."
    )
    .style("margin", 0);

  const biaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);

  // Define the glow filter
  const defs = biaMapSVG.append("defs");
  const glowFilter = defs.append("filter").attr("id", "glow");
  glowFilter.append("feGaussianBlur").attr("stdDeviation", 1).attr("result", "coloredBlur");
  const feMerge = glowFilter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const biaGroup = biaMapSVG.append("g").attr("class", "bia-group");
  biaGroup
    .attr("class", "imageDivContents")
    .selectAll("path")
    .data(biaMapData.features)
    .enter()
    .append("path")
    .attr("class", "bia-path")
    .attr("d", path)
    .attr("fill", "#0091FF")
    .attr("transform", `translate(0, ${antarcticaMapTranslateY})`)
    .style("filter", "url(#glow)");
}

// ------------------------------
// Blue Ice Area Picture
// ------------------------------

function drawBiaPicture(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", whiteColor);
  descriptionDiv.style("color", blackColor);

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "20%")
    .style("left", "17%")
    .style("width", "55%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center")
    .style("z-index", 100);

  descriptionDiv
    .append("p")
    .html(
      "Blue Ice Areas are regions where deep layers of ancient blue ice are exposed at the surface. <b>These formations result from the upward flow of ice, driven by topographic obstacles</b>, and are sustained by strong winds that prevent snow accumulation."
    );

  imageDiv.style("top", "0%").style("left", "0%").style("width", "100%").style("height", "100%");
  const imageContainer = imageDiv.append("div").style("position", "absolute").style("top", "0").style("left", "0");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/bia_explain.svg")
    .style("width", "100vw")
    .style("height", "auto")
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0");
}

// ------------------------------
// Blue Ice Area Illustration
// ------------------------------

function drawBiaIllustartionDesc(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", whiteColor);
  descriptionDiv.style("color", blackColor);
  imageDiv.style("height", "100vh").style("width", "100vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "20%")
    .style("left", "17%")
    .style("width", "55%")
    .style("height", "50%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center")
    .style("z-index", 100);

  imageDiv.style("top", "0%").style("left", "0%").style("width", "100%").style("height", "100%");

  descriptionDiv
    .append("p")
    .html(
      "What's exposed in these areas isn't just the blue ice. <b>This upward flow also brings ancient meteorites from deep within the ice to the surface,</b> making it the best meteorite-collecting spots on earth."
    )
    .style("margin", 0);

  const imageContainer = imageDiv.append("div").style("position", "absolute").style("top", "0").style("left", "0");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/bia_explain.svg")
    .style("width", "100vw")
    .style("height", "auto")
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0");

  imageContainer
    .append("img")
    .attr("class", "imageDivContents")
    .attr("src", "./data/bia_explain2.svg")
    .style("width", "100vw")
    .style("height", "auto")
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0")
    .style("z-index", "50");
}

// ------------------------------
// Collected Meteorites
// ------------------------------

function drawALH84001(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Color
  body.style("background-color", whiteColor);
  descriptionDiv.style("color", blackColor);
  imageDiv.style("height", "50vh").style("width", "50vw");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "45%")
    .style("width", "40%")
    .style("height", "30%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  descriptionDiv
    .append("p")
    .html(
      "<b>The collection of meteorites has greatly advanced our understanding of space.</b><br>ALH 84001, a meteorite that hinted at the possibility of ancient life on Mars, was also found in Blue Ice Areas."
    )
    .style("margin", 0);

  imageDiv.style("top", "25%").style("left", "15%").style("width", "auto").style("height", "55%");

  imageDiv
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center")
    .style("align-items", "center");

  imageDiv.append("img").attr("src", "./data/alh84001.jpg").style("height", "50%").style("border-radius", "10px");
  imageDiv
    .append("p")
    .html(
      "Image from: <a href='https://collections.nmnh.si.edu/search/ms/?ark=ark:/65665/32beb5ac286354e29af6088002b6d9f51'>collections.nmnh.si.edu</a>"
    );
}

// ------------------------------
// Global Warming
// ------------------------------

function drawGlobalWarming(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "20%")
    .style("width", "60%")
    .style("height", "30%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  descriptionDiv
    .append("p")
    .html(
      "<b>However, global warming poses a significant threat to meteorites in Antarctica.<br></b><br> Rising temperatures accelerate the melting of ice around meteorites, causing them to sink below the surface where researchers cannot reach them."
    )
    .style("margin", 0);
}

// ------------------------------
// Last Comment
// ------------------------------

function drawLastComment(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "20%")
    .style("width", "60%")
    .style("height", "30%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  imageDiv.style("top", "0%").style("left", "0%").style("width", "100%").style("height", "100%");
  const imageContainer = imageDiv.append("div").style("position", "absolute").style("top", "0").style("left", "0");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/ampfull.jpg")
    .style("width", "auto")
    .style("height", "100vh")
    .style("position", "absolute")
    .style("top", "0%")
    .style("left", "0%");

  descriptionDiv
    .append("p")
    .html(
      "<b><i>'The loss of Antarctic meteorites is much like the loss of data ... once they disappear, so do some of the secrets of the universe.'</i></b><br><br><span style='font-style: normal; font-weight: normal; font-size: 1rem'>Harry Zekollari, a glaciologist at the Vrije Universiteit Brussel in Belgium, in his interview with <a href='https://phys.org/news/2024-04-climate-threatens-antarctic-meteorites.html' target='_blank' style='text-decoration: none; color: #007BFF;'>Phys.org</a></span>"
    )
    .style("margin", 0);

  imageDiv
    .append("p")
    .html(
      "Image from: <a href='https://naturalhistory.si.edu/research/mineral-sciences/programs' target='_blank' style='color: #007BFF; text-decoration: none;'>naturalhistory.si.edu</a>"
    )
    .style("position", "absolute")
    .style("bottom", "20px")
    .style("right", "30px")
    .style("font-size", "0.8rem")
    .style("z-index", 100)
    .style("background-color", "rgba(255, 255, 255, 0.8)")
    .style("padding", "5px 10px");
}

// ------------------------------
// draw Credit
// ------------------------------

function drawCredit(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  imageDiv.style("top", "0%").style("left", "0%").style("width", "100%").style("height", "100%");
  const imageContainer = imageDiv.append("div").style("position", "absolute").style("top", "0").style("left", "0");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/last_scene.svg")
    .style("width", "100vw")
    .style("height", "auto")
    .style("position", "absolute")
    .style("top", "0")
    .style("left", "0");

  // Positioning
  descriptionDiv
    .style("position", "fixed")
    .style("top", "70%")
    .style("left", "5%")
    .style("width", "50%")
    .style("height", "30%")
    .style("transform", "translateY(-50%)")
    .style("display", "flex")
    .style("align-items", "center");

  const references = `
      <h1 style="font-size: 1.75rem">Why are meteorites found in Antarctica?</h1>
      <h3 style="font-size: 1rem">Data Viz by: Tak Watanabe</h3>
      <br>
      <h4 style="margin: 3px; font-size: 1rem; color: #333;">Data</h3>
      <ul style="font-size: 0.8rem; margin: 0; padding-left: 20px; color: #555; line-height: 1.6;">
          <li><a href="https://www.si.edu/openaccess" target="_blank" style="color: #007BFF; text-decoration: none;">Smithsonian Open Access | Smithsonian Institution<br></a></li>
          <li><a href="https://nsidc.org/data/nsidc-0422/versions/1" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctic Digital Elevation Model | National Snow and Ice Data Center</a></li>
          <li><a href="https://www.usap-dc.org/view/dataset/601742" target="_blank" style="color: #007BFF; text-decoration: none;">Distribution of blue ice areas in Antarctica derived from Landsat ETM+ and Modis images | U.S. Antarctic Program Data Center</a></li><br>
      </ul>
      <h4 style="margin: 3px; font-size: 1rem; color: #333;">References</h3>
      <ul style="font-size: 0.8rem; margin: 0; padding-left: 20px; color: #555; line-height: 1.6;">
          <li><a href="https://www.youtube.com/watch?v=3NUUNo43b3A" target="_blank" style="color: #007BFF; text-decoration: none;">Why Are They All In Antarctica? - MinuteEarth</a></li>    
          <li><a href="https://phys.org/news/2024-04-climate-threatens-antarctic-meteorites.html" target="_blank" style="color: #007BFF; text-decoration: none;">Climate Threatens Antarctic Meteorites - Phys.org</a></li>    
          <li><a href="https://naturalhistory.si.edu/education/teaching-resources/earth-science/meteorites-messengers-outer-space" target="_blank" style="color: #007BFF; text-decoration: none;">Meteorites: Messengers from Outer Space - Smithsonian</a></li>
          <li><a href="https://www.nationalgeographic.com/science/article/antarctica-meteorites-asteroids-climate-change" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctica Meteorites and Climate Change - National Geographic</a></li>
          <li><a href="https://www.antarctica.gov.au/about-antarctica/weather-and-climate/weather/" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctica Weather and Climate - Australian Antarctic Program</a></li>
          <li><a href="https://earthobservatory.nasa.gov/images/149554/finding-meteorite-hotspots-in-antarctica" target="_blank" style="color: #007BFF; text-decoration: none;">Finding Meteorite Hotspots in Antarctica - Earth Observatory</a></li>
          <li><a href="https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/1999RG900007" target="_blank" style="color: #007BFF; text-decoration: none;">On the glaciological, meteorological, and climatological significance of Antarctic blue ice areas - Richard Bintanja</a></li>
          <li><a href="https://www.nature.com/articles/s41558-024-01954-y.pdf" target="_blank" style="color: #007BFF; text-decoration: none;">Climate Impact on Antarctic Meteorites - Nature</a></li>
          <li><a href="https://phys.org/news/2024-04-climate-threatens-antarctic-meteorites.html" target="_blank" style="color: #007BFF; text-decoration: none;">Climate Threatens Antarctic Meteorites - Phys.org</a></li>
          </ul><br>
  `;

  descriptionDiv.append("p").html(references).style("margin", 0);
}

//

function calculateOpacity(progress) {
  let opacity;

  if (progress < fadeInOutThreshold) {
    opacity = progress * (1 / fadeInOutThreshold);
  } else if (progress >= fadeInOutThreshold && progress < 1 - fadeInOutThreshold) {
    opacity = 1;
  } else if (progress >= 1 - fadeInOutThreshold) {
    opacity = 1 - (progress - (1 - fadeInOutThreshold)) * (1 / fadeInOutThreshold);
  }

  return opacity;
}

// ------------------------------
// Scrollama Setup
// ------------------------------

async function main() {
  // Load Data
  const antarcticaGeoJSON = await loadAntarcticaGeoJSON();
  const AttributedLocationData = await loadAttributedLocationData();
  const antarcticaMeteoritesData = await loadAntarcticaMeteoritesData();
  const elevationData = await loadElevationData();
  const biaMapData = await getBiaMapData();

  // Draw Functions
  drawTitleSection();
  const [descriptionDiv, imageDiv] = buildScrollyTellingDiv();

  function drawFunctions(index, progress) {
    const opacity = calculateOpacity(progress);

    // Draw Functions
    if (index === 0) {
      drawSiStats(descriptionDiv, imageDiv);
    } else if (index === 1) {
      drawSiStats(descriptionDiv, imageDiv);
    } else if (index === 2) {
      drawCollectedLocation(descriptionDiv, imageDiv, AttributedLocationData, opacity);
    } else if (index === 3) {
      drawAntarcticaClimate(descriptionDiv, imageDiv, antarcticaGeoJSON, opacity);
    } else if (index === 4) {
      drawVisualContrast(descriptionDiv, imageDiv, antarcticaGeoJSON, opacity);
    } else if (index === 5) {
      drawCollectionSpot(descriptionDiv, imageDiv, antarcticaGeoJSON, antarcticaMeteoritesData);
    } else if (index === 6) {
      drawElevation(descriptionDiv, imageDiv, antarcticaGeoJSON, antarcticaMeteoritesData, elevationData);
    } else if (index === 7) {
      drawBlueIceAreas(descriptionDiv, imageDiv, antarcticaGeoJSON, biaMapData);
    } else if (index === 8) {
      drawBiaPicture(descriptionDiv, imageDiv);
    } else if (index === 9) {
      drawBiaIllustartionDesc(descriptionDiv, imageDiv);
    } else if (index === 10) {
      drawALH84001(descriptionDiv, imageDiv);
    } else if (index === 11) {
      drawGlobalWarming(descriptionDiv, imageDiv);
    } else if (index === 12) {
      drawLastComment(descriptionDiv, imageDiv);
    } else if (index === 13) {
      drawCredit(descriptionDiv, imageDiv);
    }
  }

  imageDiv.style("opacity", 0);
  descriptionDiv.style("opacity", 0);

  // Set up Scrollama
  const scroller = scrollama();
  scroller
    .setup({
      step: ".step",
      offset: 0,
      progress: true,
      antarcticaMapOpacity: 0,
    })
    .onStepEnter((response) => {
      const { index, progress } = response;
      drawFunctions(index, progress);
    })
    .onStepProgress((response) => {
      const { index, progress } = response;

      // Disable Tooltip
      let tooltip = d3.select("body").select("#elevation-tooltip");
      tooltip.style("visibility", "hidden");

      // Update State
      state.index = index;

      // Default Opacity
      state.descriptionDivOpacity = calculateOpacity(progress);
      state.imageDivOpacity = calculateOpacity(progress);

      // Conditional Opacity
      if (state.index === 0) {
        // Title Div
        const titleDiv = d3.select("#title_div");
        const titleDivOpacity = 1 - progress;
        titleDiv.style("opacity", titleDivOpacity);

        // Description & Image Div
        state.descriptionDivOpacity = 0;
        state.imageDivOpacity = 0;
        state.imageDivContentsOpacity = 1;
      } else if (index === 2 && progress >= 1 - fadeInOutThreshold) {
        body.style("background-color", d3.interpolateRgb(whiteColor, baseColor)((progress - 0.75) * 4));
      } else if ((index === 3 && progress >= 1 - fadeInOutThreshold) || index === 4) {
        state.imageDivOpacity = 1;
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 5 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivAntarcticaHeatmapOpacity = calculateOpacity(progress);
      } else if (index === 5 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivAntarcticaHeatmapOpacity = 1;
      } else if (index === 6 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivAntarcticaHeatmapOpacity = 1;
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 6 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivAntarcticaHeatmapOpacity = calculateOpacity(progress);
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 7 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 7 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = calculateOpacity(progress);
        body.style("background-color", d3.interpolateRgb(baseColor, whiteColor)((progress - 0.75) * 4));
      } else if (index === 8 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivBIABaseIllustrationOpacity = calculateOpacity(progress);
        state.imageDivContentsOpacity = 0;
      } else if (index === 8 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivBIABaseIllustrationOpacity = 1;
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 9 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivBIABaseIllustrationOpacity = 1;
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 9 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = calculateOpacity(progress);
        state.imageDivContentsOpacity = calculateOpacity(progress);
      } else if (index === 12 && progress >= 1 - fadeInOutThreshold) {
      } else if (index === 13 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = calculateOpacity(progress);
      } else if (index === 13 && progress >= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.descriptionDivOpacity = 1;
      }

      console.log(response);

      const imageDivContents = d3.selectAll(".imageDivContents");
      const heatMap = d3.select("#heatmap");
      const BiaBaseIllustration = d3.select("#BiaBaseIllustration");
      const blueBox = d3.select("#blue_box");

      // Update Opacity
      descriptionDiv.style("opacity", state.descriptionDivOpacity);
      imageDiv.style("opacity", state.imageDivOpacity);
      imageDivContents.style("opacity", state.imageDivContentsOpacity);
      heatMap.style("opacity", state.imageDivAntarcticaHeatmapOpacity);
      BiaBaseIllustration.style("opacity", state.imageDivBIABaseIllustrationOpacity);
      blueBox.style("opacity", state.blueBoxOpacity);
    });
}

main();
