// ------------------------------
// Constants
// ------------------------------

const body = d3.select("body").style("margin", "0").style("font-family", "Inria Sans");

// State
let state = {
  blueBoxOpacity: 1,
  descriptionDivOpacity: 0,
  imageDivOpacity: 0,
  imageDivAntarcticaHeatmapOpacity: 0,
  imageDivContentsOpacity: 0,
  imageDivBIABaseIllustrationOpacity: 0,
};

// Color
const baseColor = "#36B5C8";

// Map Projection
const projection = d3.geoStereographic().center([0, -90]).scale(675);
const path = d3.geoPath().projection(projection);

// opacity Threshold
const fadeInOutThreshold = 0.25;

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
    .style("justify-content", "center");

  const marginTop = "100px";
  const marginBottom = "100px";
  const sectionWidth = "60vw";

  const scrollDiv = scrollyTellingDiv
    .append("div")
    .attr("id", "scroll_div")
    .style("width", 1)
    .style("height", "100%")
    .style("margin-top", marginTop)
    .style("background-color", "white")
    .style("display", "flex")
    .style("flex-direction", "column");

  const stickyContainer = scrollyTellingDiv
    .append("div")
    .attr("id", "sticky_container")
    .style("height", "100vh")
    .style("margin-top", marginTop)
    .style("width", sectionWidth)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("position", "sticky")
    .style("top", "100px");

  const TextDiv = stickyContainer
    .append("div")
    .attr("id", "text_div")
    .style("height", "100px")
    .style("width", sectionWidth)
    .style("display", "flex")
    .style("flex-direction", "row");

  TextDiv.append("div")
    .attr("id", "blue_box")
    .style("background-color", baseColor)
    .style("border-radius", "5px")
    .style("flex-grow", "0")
    .style("flex-shrink", "0")
    .style("flex-basis", "10px");

  const DescriptionDiv = TextDiv.append("div")
    .attr("id", "desc_div")
    .style("flex-grow", "1")
    .style("font-size", "1.5rem")
    .style("padding-left", "15px")
    .style("padding-top", "5px")
    .style("font-weight", "400");

  const imageDiv = stickyContainer
    .append("div")
    .attr("id", "image_div")
    .style("width", sectionWidth)
    .style("display", "flex")
    .style("height", "640px")
    .style("margin-top", "50px")
    .style("margin-bottom", marginBottom)
    .style("position", "sticky");

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
    "collected_meteorites",
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
  const svgWidth = 600;
  const svgHeight = 550;

  const antarcticaMapSVG = div
    .append("svg")
    .attr("id", "map")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .style("flex", "1")
    .style("height", svgHeight)
    .style("width", svgWidth);

  // Background
  antarcticaMapSVG
    .append("g")
    .attr("id", "backgroundMap")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("rx", 10)
    .attr("height", svgHeight)
    .attr("width", svgWidth)
    .attr("fill", baseColor);

  // SVG Group for Map
  const svgMap = antarcticaMapSVG.append("g").attr("class", `antarcticaMap`).attr("transform", "translate(-215, 0)");

  svgMap
    .selectAll("path.land")
    .data(antarcticaGeoJSON.features)
    .enter()
    .append("path")
    .attr("fill", "gray")
    .attr("class", "land")
    .attr("d", path)
    .attr("fill", "white");

  return antarcticaMapSVG;
}

function addCollectionSpotHeatmap(svg, antarcticaMeteoritesData) {
  // Hexbin Setup
  const hexbin = d3
    .hexbin()
    .radius(5)
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

  // Draw Hexbin Heatmap
  const heatmapGroup = svg.append("g").attr("id", "heatmap").style("opacity", state.imageDivAntarcticaHeatmapOpacity);

  heatmapGroup
    .selectAll("path")
    .data(bins)
    .enter()
    .append("path")
    .attr("d", (d) => hexbin.hexagon())
    .attr("transform", (d) => `translate(${d.x - 215}, ${d.y})`)
    .attr("fill", (d) => {
      if (d.length > 1000) {
        return "#E6955E";
      } else if (d.length > 500) {
        return "#ECF06A";
      } else if (d.length > 0) {
        return "#9DC165";
      }
    })
    .attr("stroke", "gray")
    .attr("stroke-width", 0.5);
}

function drawElevationMap(AntarcticaMapSVG, elevationData) {
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
        return "#EDEDED";
      } else if (elevation === 2000) {
        return "#D8D8D8";
      } else if (elevation === 3000) {
        return "#C6C6C6";
      } else if (elevation >= 3500) {
        return "#BABABA";
      }
    })
    .attr("transform", "translate(-215, 0)");
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
    .style("background-image", "linear-gradient(#76CDD9, #FFFFFF)");

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
    .html("GET TO KNOW THEIR INTIMATE BOND... AND CRISIS")
    .style("font-size", "42px")
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

  // Description
  descriptionDiv
    .append("p")
    .html(
      "<b>The Smithsonian Institution houses a world-class meteorite collection.</b> This collection, preserved in the National Museum of Natural History, includes over 55,000 specimens and more than 20,000 distinct meteorites."
    )
    .style("margin", 0);

  imageDiv.style("display", "flex").style("flex-direction", "row").style("align-items", "center");

  // Specimen
  const siStatsLeft = imageDiv.append("div").style("flex", "1").style("text-align", "center");
  siStatsLeft
    .append("p")
    .attr("class", "si_stats_metrics_name")
    .text("Specimen")
    .style("font-size", "2rem")
    .style("color", "#9D9D9D")
    .style("margin", "0");

  siStatsLeft.append("p").attr("class", "si_stats_metrics_number").text("55,000+").style("font-size", "5rem");

  // Distinct Meteorite
  const siStatsRight = imageDiv.append("div").style("flex", "1").style("text-align", "center");
  siStatsRight
    .append("p")
    .attr("class", "si_stats_metrics_name")
    .text("Distinct Meteorite")
    .style("font-size", "2rem")
    .style("color", "#9D9D9D")
    .style("margin", "0");

  siStatsRight.append("p").attr("class", "si_stats_metrics_number").text("20,000+").style("font-size", "5rem");
}

// ------------------------------
// Collected Location
// ------------------------------

function drawCollectedLocation(descriptionDiv, imageDiv, AttributedLocationData) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Description
  descriptionDiv
    .append("p")
    .html(
      "Where are these meteorites collected? <b>The Smithsonian's collection shows that 71% of its meteorites come from Antarctica—a proportion much higher than any other continent."
    )
    .style("margin", 0);

  // Chart
  imageDiv.style("flex-direction", "column");

  const attrLocationChartDiv = imageDiv.append("div");

  attrLocationChartDiv.append("p").style("margin", "0 0 55px 55px").style("font-weight", 100);

  const attrLocationChartSVG = imageDiv.append("svg").style("width", "100%").style("height", "100%");

  const XofattrLocationChartMargin = { left: 220, right: 50 };
  const attrLocationChartWidth = 750;
  const attrLocationChartHeight = 500;

  // Define X axis Scale
  const attrLocationChartXScale = d3
    .scaleLinear()
    .domain([0, d3.max(AttributedLocationData.map((d) => d[1].length_ratio))])
    .range([0, attrLocationChartWidth - XofattrLocationChartMargin.left]);

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
    .attr("transform", `translate(${XofattrLocationChartMargin.left},0)`)
    .style("font-size", "1rem")
    .style("font-weight", 100)
    .attr("x", -100);

  // Format Y Axis
  yAxis.select(".domain").attr("stroke", "#E8E8E8").attr("stroke-width", "2");

  // Draw Bar
  attrLocationChartSVG
    .selectAll("rect")
    .data(AttributedLocationData)
    .enter()
    .append("rect")
    .attr("x", XofattrLocationChartMargin.left)
    .attr("y", (d) => attrLocationChartYScale(d[0]))
    .attr("width", (d) => attrLocationChartXScale(d[1].length_ratio))
    .attr("height", attrLocationChartYScale.bandwidth())
    .attr("fill", (d) => (d[0] === "Antarctica" ? baseColor : "#DBDBDB"))
    .attr("rx", 10);

  // Draw Chart Label
  attrLocationChartSVG
    .selectAll(".text")
    .data(AttributedLocationData)
    .enter()
    .append("text")
    .text((d) => Math.round(d[1].length_ratio * 100) + "%")
    .attr("x", (d) => XofattrLocationChartMargin.left + attrLocationChartXScale(d[1].length_ratio) + 15)
    .attr("y", (d) => attrLocationChartYScale(d[0]) + 21)
    .attr("fill", (d) => (d[0] === "Antarctica" ? baseColor : "#858585"))
    .style("font-size", "1.5rem")
    .style("font-weight", 200);
}

// ------------------------------
// Antarctica's Climate
// ------------------------------

function drawAntarcticaClimate(descriptionDiv, imageDiv, antarcticaGeoJSON) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Description
  descriptionDiv
    .append("p")
    .html(
      "Why Antarctica? <b>The first reason is the climate.</b> The extremely cold temperatures slow weathering, while the dry conditions limit chemical alteration. Some meteorites found in Antarctica fell to Earth more than a million years ago."
    )
    .style("margin", 0);

  // Image Div Setup
  const climateAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);
  const climateText = climateAntarcticaMapSVG.append("g").attr("class", "imageDivContents");

  const xHighest = 150;
  const xCoast = 355;
  const y = 245;

  climateText
    .append("text")
    .text("Avg. along the coast")
    .attr("x", xCoast)
    .attr("y", y)
    .style("fill", baseColor)
    .style("font-weight", 400)
    .style("text-anchor", "start")
    .style("font-size", "1rem");

  climateText
    .append("text")
    .text("-10 °C")
    .attr("x", xCoast + 20)
    .attr("y", y + 40)
    .style("fill", baseColor)
    .style("font-size", "2.3rem")
    .style("font-weight", 400)
    .style("text-anchor", "start");

  climateText
    .append("text")
    .text("Avg. at the highest parts")
    .attr("x", xHighest)
    .attr("y", y)
    .style("fill", baseColor)
    .style("font-weight", 400)
    .style("font-size", "1rem")
    .style("text-anchor", "start");

  climateText
    .append("text")
    .text("-70 °C")
    .attr("x", xHighest + 35)
    .attr("y", y + 40)
    .style("fill", baseColor)
    .style("font-size", "2.3rem")
    .style("font-weight", 400)
    .style("text-anchor", "start");
}

// ------------------------------
// Visual Contrast
// ------------------------------

function drawVisualContrast(descriptionDiv, imageDiv, antarcticaGeoJSON) {
  removeExistingContents(descriptionDiv, imageDiv);
  // Description
  descriptionDiv
    .append("p")
    .html(
      "<b>Another reason is the clear visual contrast.</b> Most meteorites are dark in color, making them easier to spot on the white ice surface than on other surfaces like vegetation, gravel, or urban areas."
    )
    .style("margin", 0);

  const visContrastAntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);

  const meteoriteCoordinates = [
    { x: 150, y: 250 },
    { x: 250, y: 110 },
    { x: 250, y: 230 },
    { x: 350, y: 170 },
    { x: 350, y: 290 },
    { x: 450, y: 230 },
    { x: 450, y: 350 },
    { x: 400, y: 420 },
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
    .attr("width", 25)
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);
}

// ------------------------------
// Collection Spot
// ------------------------------

function drawCollectionSpot(descriptionDiv, imageDiv, antarcticaGeoJSON, antarcticaMeteoritesData) {
  removeExistingContents(descriptionDiv, imageDiv);

  // Description
  descriptionDiv
    .append("p")
    .html(
      "So, can meteorites be found anywhere in Antarctica? Not really. <b>The distribution of meteorite collection spots is highly uneven.</b> Most meteorites are discovered in specific highlighted areas shown on the map."
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

  // Description
  descriptionDiv
    .append("p")
    .html(
      "What is special about these areas? <b>One reason is that they are relatively low-elevation regions.</b> This means they have less snow accumulation compared to higher elevations, leaving meteorites on the surface more often."
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

  descriptionDiv
    .append("p")
    .html(
      "However, there's another crucial feature that makes these areas unique: Blue Ice Areas</b> — special regions that occupy only 1% of Antarctica's vast continent."
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
    .attr("transform", "translate(-215, 0)")
    .style("filter", "url(#glow)"); // Apply the glow filter
}

// ------------------------------
// Blue Ice Area Picture
// ------------------------------

function drawBiaPicture(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  descriptionDiv
    .append("p")
    .html(
      "<b>Blue Ice Areas are regions where deep layers of ancient blue ice are exposed at the surface.</b> These formations result from the upward flow of ice, driven by topographic obstacles, and are sustained by strong winds that prevent snow accumulation."
    )
    .style("margin", 0);

  const imageContainer = imageDiv
    .append("div")
    .style("position", "relative")
    .style("width", "100%")
    .style("height", "100%");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/bia_explain.png")
    .style("width", "600px")
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)");
}

// ------------------------------
// Blue Ice Area Illustration
// ------------------------------

function drawBiaIllustartionDesc(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  descriptionDiv
    .append("p")
    .html(
      "What's exposed in these areas isn't just the blue ice. <b>This upward flow also brings ancient meteorites from deep within the ice to the surface, where they accumulate in the Blue Ice Areas.</b>"
    )
    .style("margin", 0);

  const imageContainer = imageDiv
    .append("div")
    .style("position", "relative")
    .style("width", "100%")
    .style("height", "100%");

  imageContainer
    .append("img")
    .attr("id", "BiaBaseIllustration")
    .attr("src", "./data/bia_explain.png")
    .style("width", "600px")
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)");

  imageContainer
    .append("img")
    .attr("class", "imageDivContents")
    .attr("src", "./data/bia_explain2.png")
    .style("width", "600px")
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)");
}

// ------------------------------
// Collected Meteorites
// ------------------------------

function drawCollectedMeteorites(descriptionDiv, imageDiv, antarcticaGeoJSON) {
  removeExistingContents(descriptionDiv, imageDiv);

  descriptionDiv
    .append("p")
    .html(
      "<b>This remarkable phenomenon has made the Blue Ice Areas the best meteorite-collecting spots on earth:</b> about 1,000 meteorites are collected annually in these areas, and it is estimated that many more are yet to be discovered."
    )
    .style("margin", 0);

  const AntarcticaMapSVG = drawAntarcticaMap(imageDiv, antarcticaGeoJSON);

  AntarcticaMapSVG.append("text")
    .text("1,000")
    .attr("x", 290)
    .attr("y", 270)
    .style("fill", baseColor)
    .style("font-size", "3.75rem")
    .style("font-weight", 300);

  AntarcticaMapSVG.append("text")
    .text("Meteorites/Year")
    .attr("x", 290)
    .attr("y", 310)
    .style("fill", baseColor)
    .style("font-size", "1.15rem")
    .style("font-weight", 200);
}

// ------------------------------
// Collected Meteorites
// ------------------------------

function drawALH84001(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  descriptionDiv
    .append("p")
    .html(
      "<b>The collection of meteorites has greatly advanced our understanding of space.</b> ALH 84001, a meteorite that hinted at the possibility of ancient life on Mars, was also found in Blue Ice Areas."
    )
    .style("margin", 0);

  imageDiv
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center")
    .style("align-items", "center");

  imageDiv.append("img").attr("src", "./data/alh84001.jpg").style("width", "600px");
  imageDiv
    .append("p")
    .html(
      "image source : <a href='https://airandspace.si.edu/multimedia-gallery/web12004-2011hjpg'>airandspace.si.edu</a>"
    );
}

// ------------------------------
// Global Warming
// ------------------------------

function drawGlobalWarming(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  descriptionDiv
    .append("p")
    .html(
      "However, <b>Antarctic meteorites are now threatened by global warming.</b> Rising temperatures are causing ice to melt more easily, even in Blue Ice Areas, which leads to exposed meteorites sinking deeper into the ice."
    )
    .style("margin", 0);

  imageDiv
    .append("img")
    .attr("src", "./data/bia_losing.png")
    .style("display", "block")
    .style("margin", "auto")
    .style("width", "600px");
}

// ------------------------------
// Last Comment
// ------------------------------

function drawLastComment(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  imageDiv.style("display", "flex").style("align-items", "center").style("justify-content", "center");

  imageDiv
    .append("p")
    .html(
      "<b><i>'The loss of Antarctic meteorites is much like the loss of data ...<br> once they disappear, so do some of the secrets of the universe.'</i></b><br><br><span style='font-style: normal; font-weight: normal; font-size: 1rem'>Harry Zekollari, a glaciologist at the Vrije Universiteit Brussel in Belgium, in his interview with <a href='https://phys.org/news/2024-04-climate-threatens-antarctic-meteorites.html' target='_blank' style='text-decoration: none; color: #007BFF;'>Phys.org</a></span>"
    )
    .style("margin", "1rem 0")
    .style("font-size", "1.5rem")
    .style("font-family", "Georgia, 'Times New Roman', Times, serif")
    .style("line-height", "1.8")
    .style("padding", "1rem")
    .style("color", "#333")
    .style("text-align", "center")
    .style("transform", "translateY(-50%)");
}

// ------------------------------
// draw Credit
// ------------------------------

function drawCredit(descriptionDiv, imageDiv) {
  removeExistingContents(descriptionDiv, imageDiv);

  imageDiv.style("display", "flex").style("align-items", "center").style("justify-content", "center");

  const references = `
  <div style="padding: 0px; font-family: Arial, sans-serif;">
      <h1>Why are meteorites found in Antarctica?</h1>
      <h3>Data Viz by: Tak Watanabe</h3>
      <br>
      <h3 style="margin-top: 0; color: #333;">Data</h3>
      <ul style="margin: 0; padding-left: 20px; list-style-type: disc; color: #555; line-height: 1.6;">
          <li><a href="https://www.si.edu/openaccess" target="_blank" style="color: #007BFF; text-decoration: none;">Smithsonian Open Access | Smithsonian Institution</a></li>
          <li><a href="https://nsidc.org/data/nsidc-0422/versions/1" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctic Digital Elevation Model | National Snow and Ice Data Center</a></li>
          <li><a href="https://www.usap-dc.org/view/dataset/601742" target="_blank" style="color: #007BFF; text-decoration: none;">Distribution of blue ice areas in Antarctica derived from Landsat ETM+ and Modis images | U.S. Antarctic Program Data Center</a></li><br>
      </ul>
      <h3 style="margin-top: 0; color: #333;">References:</h3>
      <ul style="margin: 0; padding-left: 20px; list-style-type: disc; color: #555; line-height: 1.6;">
          <li><a href="https://naturalhistory.si.edu/education/teaching-resources/earth-science/meteorites-messengers-outer-space" target="_blank" style="color: #007BFF; text-decoration: none;">Meteorites: Messengers from Outer Space - Smithsonian</a></li>
          <li><a href="https://www.nationalgeographic.com/science/article/antarctica-meteorites-asteroids-climate-change" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctica Meteorites and Climate Change - National Geographic</a></li>
          <li><a href="https://www.antarctica.gov.au/about-antarctica/weather-and-climate/weather/" target="_blank" style="color: #007BFF; text-decoration: none;">Antarctica Weather and Climate - Australian Antarctic Program</a></li>
          <li><a href="https://earthobservatory.nasa.gov/images/149554/finding-meteorite-hotspots-in-antarctica" target="_blank" style="color: #007BFF; text-decoration: none;">Finding Meteorite Hotspots in Antarctica - Earth Observatory</a></li>
          <li><a href="https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/1999RG900007" target="_blank" style="color: #007BFF; text-decoration: none;">On the glaciological, meteorological, and climatological significance of Antarctic blue ice areas - Richard Bintanja</a></li>
          <li><a href="https://www.nature.com/articles/s41558-024-01954-y.pdf" target="_blank" style="color: #007BFF; text-decoration: none;">Climate Impact on Antarctic Meteorites - Nature</a></li>
          <li><a href="https://phys.org/news/2024-04-climate-threatens-antarctic-meteorites.html" target="_blank" style="color: #007BFF; text-decoration: none;">Climate Threatens Antarctic Meteorites - Phys.org</a></li>
      </ul><br>
  </div>
  `;

  imageDiv.append("p").html(references).style("margin", 0).style("transform", "translateY(-20%)");
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
      drawCollectedMeteorites(descriptionDiv, imageDiv, antarcticaGeoJSON);
    } else if (index === 11) {
      drawALH84001(descriptionDiv, imageDiv);
    } else if (index === 12) {
      drawGlobalWarming(descriptionDiv, imageDiv);
    } else if (index === 13) {
      drawLastComment(descriptionDiv, imageDiv);
    } else if (index === 14) {
      drawCredit(descriptionDiv, imageDiv);
    }
  }

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

      state.index = index;

      // Default Opacity
      state.descriptionDivOpacity = calculateOpacity(progress);
      state.imageDivOpacity = calculateOpacity(progress);
      state.blueBoxOpacity = 1;

      // Conditional Opacity
      if (state.index === 0) {
        state.descriptionDivOpacity = 0;
        state.imageDivOpacity = 0;
        state.blueBoxOpacity = 0;
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
      } else if (index === 8 && progress <= 1 - fadeInOutThreshold) {
        state.imageDivOpacity = 1;
        state.imageDivBIABaseIllustrationOpacity = calculateOpacity(progress);
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
        state.blueBoxOpacity = calculateOpacity(progress);
      } else if (index === 13) {
        state.blueBoxOpacity = 0;
        state.imageDivOpacity = calculateOpacity(progress);
      } else if (index === 14) {
        state.blueBoxOpacity = 0;
        state.imageDivOpacity = calculateOpacity(progress * 2);
      }

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

      console.log(response);
    });
}

main();
