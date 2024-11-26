// ------------------------------
// Constants
// ------------------------------

const body = d3.select("body").style("margin", "0").style("font-family", "Inria Sans");

// Color
const baseColor = "#36B5C8";

// Map Projection
const projection = d3.geoStereographic().center([0, -90]).scale(675);
const path = d3.geoPath().projection(projection);

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

function addSection(sectionId) {
  const marginTop = "100px";
  const marginBottom = "100px";
  const sectionWidth = "55vw";

  const mainDiv = body
    .append("div")
    .attr("id", sectionId)
    .attr("class", "step")
    .style("width", "100%")
    .style("height", "100vh")
    .style("background-color", "white")
    .style("display", "flex")
    .style("place-items", "center")
    .style("flex-direction", "column");

  const TextDiv = mainDiv
    .append("div")
    .attr("id", `${sectionId}_text_div`)
    .style("height", "100px")
    .style("margin-top", marginTop)
    .style("width", sectionWidth)
    .style("display", "flex")
    .style("flex-direction", "row");

  const blueBoxDiv = TextDiv.append("div")
    .attr("id", `${sectionId}_blue_box_div`)
    .style("background-color", baseColor)
    .style("border-radius", "5px")
    .style("flex-grow", "0")
    .style("flex-shrink", "0")
    .style("flex-basis", "10px");

  const DescriptionDiv = TextDiv.append("div")
    .attr("id", `${sectionId}_description_div`)
    .style("flex-grow", "1")
    .style("font-size", "1.5rem")
    .style("padding-left", "15px")
    .style("padding-top", "5px")
    .style("font-weight", "400");

  const imageDiv = mainDiv
    .append("div")
    .attr("id", `${sectionId}_image_div`)
    .style("width", sectionWidth)
    .style("display", "flex")
    .style("flex-grow", "1")
    .style("margin-top", marginTop)
    .style("margin-bottom", marginBottom);

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
    .radius(3)
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
  svg
    .append("g")
    .attr("class", "hexmap")
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
    .attr("id", "antarctica_elevation")
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

// ------------------------------
// Title Section
// ------------------------------

function drawTitleSection() {
  const titleDiv = body
    .append("div")
    .attr("id", "title_div")
    .attr("class", "step")
    .style("display", "flex")
    .style("background-color", baseColor)
    .style("height", "100vh")
    .style("display", "flex")
    .style("padding-left", "5vw")
    .style("align-items", "center");

  titleDiv
    .append("h1")
    .text("Why are meteorites always found in Antarctica?")
    .style("font-size", "72px")
    .style("color", "white")
    .style("font-weight", "700")
    .style("width", "1200px");
}

// ------------------------------
// Sec1. Smithsonian Collection Stats
// ------------------------------

function drawSiStats() {
  const siStatsSectionId = "si_stats";
  const [siStatsDescDiv, siStatsImageDiv] = addSection(siStatsSectionId);

  // Description
  siStatsDescDiv
    .append("p")
    .html(
      "<b>The Smithsonian Institution is renowned for its extensive collection of meteorites.</b><br>This collection, housed in the National Museum of Natural History, includes over 55,000 specimens representing more than 20,000 distinct meteorites."
    )
    .style("margin", 0);

  siStatsImageDiv.style("display", "flex").style("flex-direction", "row").style("align-items", "center");

  // Specimen
  const siStatsLeft = siStatsImageDiv.append("div").style("flex", "1");
  siStatsLeft
    .append("p")
    .attr("class", "si_stats_metrics_name")
    .text("Specimen")
    .style("font-size", "2rem")
    .style("color", "#9D9D9D")
    .style("margin", "0");
  siStatsLeft.append("p").attr("class", "si_stats_metrics_number").text("55,000+").style("font-size", "5rem");

  // Distinct Meteorite
  const siStatsRight = siStatsImageDiv.append("div").style("flex", "1");
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
// Sec2. Collected Location
// ------------------------------

function drawCollectedLocation(AttributedLocationData) {
  const LocationSectionId = "collected_location";
  const [LocationDescDiv, LocationImageDiv] = addSection(LocationSectionId);

  // Description
  LocationDescDiv.append("p")
    .html(
      "<b>Where are these meteorites collected? According to the Smithsonian’s collection, 71% of the meteorites were found in Antarctica</b>—a significantly higher proportion than from any other continent."
    )
    .style("margin", 0);

  // Chart
  LocationImageDiv.style("flex-direction", "column");

  const attrLocationChartDiv = LocationImageDiv.append("div");

  attrLocationChartDiv
    .append("p")
    .text("Attributed Locations")
    .style("margin", "0 0 30px 55px")
    .style("font-weight", 100);

  const attrLocationChartSVG = LocationImageDiv.append("svg").style("width", "100%").style("height", "100%");

  const XofattrLocationChartMargin = { left: 200, right: 50 };
  const attrLocationChartWidth = 750;
  const attrLocationChartHeight = 400;

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
    .attr("fill", (d) => (d[0] === "Antarctica" ? baseColor : "#DBDBDB"));

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
// Section3. Antarctica's Climate
// ------------------------------

function drawAntarcticaClimate(antarcticaGeoJSON) {
  const climateSectionId = "antarctica_climate";
  const [climateDescDiv, climateImageDiv] = addSection(climateSectionId);

  // Description
  climateDescDiv
    .append("p")
    .html(
      "What makes Antarctica so ideal for meteorites? One key reason is its climate. <b>The extremely cold temperatures slow weathering, while the dry conditions limit chemical alterations</b>, preserving meteorites in remarkably pristine condition for many years."
    )
    .style("margin", 0);

  const climateAntarcticaMapSVG = drawAntarcticaMap(climateImageDiv, antarcticaGeoJSON);

  climateAntarcticaMapSVG
    .append("text")
    .text("Avg. Temp.")
    .attr("x", 290)
    .attr("y", 240)
    .style("fill", baseColor)
    .style("font-size", "1.25rem")
    .style("font-weight", 100);

  climateAntarcticaMapSVG
    .append("text")
    .text("-71 °F")
    .attr("x", 285)
    .attr("y", 300)
    .style("fill", baseColor)
    .style("font-size", "4rem")
    .style("font-weight", 300);
}

// ------------------------------
// Section4. Visual Contrast
// ------------------------------

function drawVisualContrast(antarcticaGeoJSON) {
  const visContrastSectionId = "antarctica_visual_contrast";
  const [visContrastDescDiv, visContrastImageDiv] = addSection(visContrastSectionId);

  // Description
  visContrastDescDiv
    .append("p")
    .html(
      "Another reason is the stark visual contrast. <b>Most meteorites are dark-colored, making them much easier to spot on the white ice sheets</b> compared to vegetated, gravel-covered, or urban areas."
    )
    .style("margin", 0);

  const visContrastAntarcticaMapSVG = drawAntarcticaMap(visContrastImageDiv, antarcticaGeoJSON);

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
// Section5. Collection Spot
// ------------------------------

function drawCollectionSpot(antarcticaGeoJSON, antarcticaMeteoritesData) {
  const CollectionSpotSectionId = "collection_spot";
  const [collectionSpotDescDiv, collectionSpotImageDiv] = addSection(CollectionSpotSectionId);

  // Description
  collectionSpotDescDiv
    .append("p")
    .html(
      "So, where in Antarctica are meteorites found? Interestingly, their distribution across the continent is highly uneven. <b>According to the Smithsonian's collection, most meteorites are discovered in the highlighted areas shown on the map.</b>"
    )
    .style("margin", 0);

  // Draw Hexbin on Map
  const correctionSpotAntarcticaMapSVG = drawAntarcticaMap(collectionSpotImageDiv, antarcticaGeoJSON);
  addCollectionSpotHeatmap(correctionSpotAntarcticaMapSVG, antarcticaMeteoritesData);
}

// ------------------------------
// Section6. Elevation
// ------------------------------

function drawElevation(antarcticaGeoJSON, antarcticaMeteoritesData, elevationData) {
  const elevationSectionId = "elevation";
  const [elevationDescDiv, elevationImageDiv] = addSection(elevationSectionId);

  // Description
  elevationDescDiv
    .append("p")
    .html(
      "What are the characteristics of these areas? Firstly, they are low-lying regions. <b>Lower areas tend to accumulate less snow, allowing meteorites to remain on the surface.</b> This makes them easier to spot compared to higher-altitude regions with deeper snow cover."
    )
    .style("margin", 0);

  const elevationAntarcticaMapSVG = drawAntarcticaMap(elevationImageDiv, antarcticaGeoJSON);
  drawElevationMap(elevationAntarcticaMapSVG, elevationData);
  addCollectionSpotHeatmap(elevationAntarcticaMapSVG, antarcticaMeteoritesData);
}

// ------------------------------
// Section7. Snow Flow
// ------------------------------

function drawSnowFlow(antarcticaGeoJSON, antarcticaMeteoritesData, elevationData) {
  const snowFlowSectionId = "snow_flow";
  const [snowFlowDescDiv, snowFlowImageDiv] = addSection(snowFlowSectionId);

  snowFlowDescDiv
    .append("p")
    .html(
      "Another factor is the slow movement of snow flow in Antarctica. <br>Over thousands of years, <b>snow gradually flows from higher to lower elevations, carrying meteorites that originally fell in higher regions into lower areas.</b>"
    )
    .style("margin", 0);

  const snowFlowAntarcticaMapSVG = drawAntarcticaMap(snowFlowImageDiv, antarcticaGeoJSON);
  drawElevationMap(snowFlowAntarcticaMapSVG, elevationData);
  addCollectionSpotHeatmap(snowFlowAntarcticaMapSVG, antarcticaMeteoritesData);
}

// ------------------------------
// Blue Ice Area
// ------------------------------

function drawBlueIceAreas(antarcticaGeoJSON, biaMapData, antarcticaMeteoritesData, elevationData) {
  const biaSectionId = "bia";
  const [biaDescDiv, biaImageDiv] = addSection(biaSectionId);

  biaDescDiv
    .append("p")
    .html(
      "<b>The most important reason, however, is that these regions are Blue Ice Areas</b>—ideal spots for collecting meteorites due to unique and remarkable conditions."
    )
    .style("margin", 0);

  const biaMapSVG = drawAntarcticaMap(biaImageDiv, antarcticaGeoJSON);
  const biaGroup = biaMapSVG.append("g").attr("class", "bia-group");
  biaGroup
    .selectAll("path")
    .data(biaMapData.features)
    .enter()
    .append("path")
    .attr("class", "bia-path")
    .attr("d", path)
    .attr("fill", "#0091FF")
    .attr("transform", "translate(-215, 0)");
}

// ------------------------------
// Blue Ice Area Illustration
// ------------------------------

function drawBiaIllustartionDesc() {
  const biaIllustrationSectionId = "bia_illustration";
  const [biaIllustartionDescDiv, biaIllustartionImageDiv] = addSection(biaIllustrationSectionId);

  biaIllustartionDescDiv
    .append("p")
    .html(
      "These areas are unique because deeper blue ice layers emerge on the surface due to specific climatic and topographical factors. <b>This phenomenon reveals meteorites previously hidden beneath the surface, facilitating their discovery by researchers.</b>"
    )
    .style("margin", 0)
    .style("font-size", "1.4rem");

  biaIllustartionImageDiv
    .append("img")
    .attr("src", "./data/bia_explain.png")
    .style("display", "block")
    .style("margin", "auto")
    .style("width", "600px");
}

// ------------------------------
// Collected Meteorites
// ------------------------------

function drawCollectedMeteorites(antarcticaGeoJSON) {
  const CollectedMeteoritesSectionId = "collected_meteorites";
  const [CollectedMeteoritesDescDiv, CollectedMeteoritesImageDiv] = addSection(CollectedMeteoritesSectionId);

  CollectedMeteoritesDescDiv.append("p")
    .html(
      "This unique phenomenon makes BIAs the most efficient locations for collecting meteorites on Earth. <b>Each year, scientists head to these areas and recover approximately 1,000 meteorites.</b> In addition, it is estimated that many more meteorites remain undiscovered."
    )
    .style("margin", 0)
    .style("font-size", "1.4rem");

  const AntarcticaMapSVG = drawAntarcticaMap(CollectedMeteoritesImageDiv, antarcticaGeoJSON);

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

function drawALH84001() {
  const ALH84001SectionId = "ALH84001";
  const [ALH84001DescDiv, ALH84001ImageDiv] = addSection(ALH84001SectionId);

  ALH84001DescDiv.append("p")
    .html(
      "<b>Meteorites discovered in Antarctica have significantly advanced our understanding of space.</b> ALH 84001, a meteorite that suggested the possibility of ancient life on Mars, was also found in a Blue Ice Area of Antarctica."
    )
    .style("margin", 0);

  ALH84001ImageDiv.style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center")
    .style("align-items", "center");

  ALH84001ImageDiv.append("img").attr("src", "./data/alh84001.jpg").style("width", "600px");
  ALH84001ImageDiv.append("p").html(
    "image source : <a href='https://airandspace.si.edu/multimedia-gallery/web12004-2011hjpg'>airandspace.si.edu</a>"
  );
}

// ------------------------------
// Global Warming
// ------------------------------

function drawGlobalWarming() {
  const globalWarmingSectionId = "global_warming";
  const [globalWarmingDescDiv, globalWarmingImageDiv] = addSection(globalWarmingSectionId);

  globalWarmingDescDiv
    .append("p")
    .html(
      "<b>However, meteorites in Antarctica are threatened by global warming.</b> Rising temperatures are accelerating ice melt, causing meteorites in blue ice areas to sink into the deep layers of ice, where researchers cannot reach."
    )
    .style("margin", 0);

  globalWarmingImageDiv
    .append("img")
    .attr("src", "./data/bia_losing.png")
    .style("display", "block")
    .style("margin", "auto")
    .style("width", "600px");
}

// ------------------------------
// Last Comment
// ------------------------------

function drawLastComment(antarcticaGeoJSON, antarcticaMeteoritesData) {
  const lastCommentSectionId = "last_comment";
  const [lastCommentDescDiv, lastCommentImageDiv] = addSection(lastCommentSectionId);

  lastCommentDescDiv
    .append("p")
    .html(
      "Harry Zekollari, a glaciologist at the Vrije Universiteit Brussel in Belgium, says <b>'The loss of Antarctic meteorites is much like the loss of data ... once they disappear, so do some of the secrets of the universe.'</b>"
    )
    .style("margin", 0);

  // Draw Hexbin on Map
  const lastCommentAntarcticaMapSVG = drawAntarcticaMap(lastCommentImageDiv, antarcticaGeoJSON);
  addCollectionSpotHeatmap(lastCommentAntarcticaMapSVG, antarcticaMeteoritesData);
}

// // ------------------------------
// // Scrollama Setup
// // ------------------------------

// const scroller = scrollama();

// scroller
//   .setup({
//     step: ".step",
//   })
//   .onStepEnter((response) => {
//     // console.log("onStepEnter");
//     // console.log(response);
//   })
//   .onStepExit((response) => {
//     // console.log("onStepExit");
//     // console.log(response);
//   });

async function main() {
  // Load Data
  const antarcticaGeoJSON = await loadAntarcticaGeoJSON();
  const AttributedLocationData = await loadAttributedLocationData();
  const antarcticaMeteoritesData = await loadAntarcticaMeteoritesData();
  const elevationData = await loadElevationData();
  const biaMapData = await getBiaMapData();

  // Draw Functions
  drawTitleSection();
  drawSiStats();
  drawCollectedLocation(AttributedLocationData);
  drawAntarcticaClimate(antarcticaGeoJSON);
  drawVisualContrast(antarcticaGeoJSON);
  drawCollectionSpot(antarcticaGeoJSON, antarcticaMeteoritesData);
  drawElevation(antarcticaGeoJSON, antarcticaMeteoritesData, elevationData);
  drawSnowFlow(antarcticaGeoJSON, antarcticaMeteoritesData, elevationData);
  drawBlueIceAreas(antarcticaGeoJSON, biaMapData, antarcticaMeteoritesData, elevationData);
  drawBiaIllustartionDesc();
  drawCollectedMeteorites(antarcticaGeoJSON);
  drawALH84001();
  drawGlobalWarming();
  drawLastComment(antarcticaGeoJSON, antarcticaMeteoritesData);
}

main();
