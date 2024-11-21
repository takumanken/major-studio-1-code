const body = d3.select("body").style("margin", "0");

// ------------------------------
// Title Section
// ------------------------------

const titleDiv = body
  .append("div")
  .attr("id", "title_div")
  .attr("class", "step")
  .style("display", "flex")
  .style("background-color", "#aacfe4ff")
  .style("height", "100vh")
  .style("display", "flex")
  .style("flex-direction", "column")
  .style("justify-content", "center")
  .style("align-items", "center");

titleDiv.append("h1").text("Smithsonian’s Meteorite & Blue Ice in Antarctica");
titleDiv.append("h2").text("Get to know their intimate bond… and CRISIS");

// ------------------------------
// Smithsonoan Meteorite Stats
// ------------------------------

const siStatsDiv = body
  .append("div")
  .attr("class", "step")
  .style("height", "100vh")
  .attr("id", "si_stats_div")
  .style("background-color", "white")
  .style("display", "grid")
  .style("place-items", "center");

const siStatsInnerDiv = siStatsDiv
  .append("div")
  .attr("id", "si_stats_inner_div")
  .style("display", "grid")
  .style("grid-template-rows", "10vh 20vh 10vh")
  .style("grid-template-columns", "1fr 1fr")
  .style("width", "50vw");

// Header
const siStatsHeader = siStatsInnerDiv.append("div").attr("class", "si-stats").style("grid-column", "1 / -1");
siStatsHeader
  .append("span")
  .attr("class", "si_stats_title")
  .text("Smithsonian’s National Meteorite Collection")
  .style("font-size", "24px");

// Specimen
const siStatsLeft = siStatsInnerDiv.append("div");
siStatsLeft.append("p").attr("class", "si_stats_metrics_name").text("Specimen");
siStatsLeft.append("p").attr("class", "si_stats_metrics_number").text("55,000+");

// Distinct Meteorite
const siStatsRight = siStatsInnerDiv.append("div");
siStatsRight.append("p").attr("class", "si_stats_metrics_name").text("Distinct Meteorite");
siStatsRight.append("p").attr("class", "si_stats_metrics_number").text("20,000+");

// Source
const siStatsFooter = siStatsInnerDiv.append("div").attr("class", "si-stats-footer").style("grid-column", "1 / -1");
siStatsFooter
  .append("span")
  .text("Source: ")
  .append("a")
  .attr(
    "href",
    "https://naturalhistory.si.edu/education/teaching-resources/earth-science/meteorites-messengers-outer-space"
  )
  .text("naturalhistory.si.edu");

// ------------------------------
// Attributed Locations
// ------------------------------

const attrLocationDiv = body
  .append("div")
  .attr("class", "step")
  .style("height", "100vh")
  .attr("id", "attr_location_div")
  .style("background-color", "white")
  .style("display", "grid")
  .style("place-items", "center");

const attrLocationDivInnerDiv = attrLocationDiv
  .append("div")
  .attr("id", "attr_location_inner_div")
  .style("display", "grid")
  .style("grid-template-rows", "10vh 50vh")
  .style("grid-template-columns", "40vw 30vw");

// Title
const attrLocationTitleDiv = attrLocationDivInnerDiv.append("div").style("grid-column", "1 / -1");
attrLocationTitleDiv.append("span").text("Attributed Locations");

// Chart
async function getattributedLocationData() {
  const data = await d3.json("./data/attributed_locations.json");
  return data;
}

const attrLocationChartDiv = attrLocationDivInnerDiv.append("div");
const attrLocationChartSVG = attrLocationChartDiv.append("svg").style("width", "100%").style("height", "100%");

const XofattrLocationChartMargin = { left: 100, right: 50 };
const attrLocationChartWidth = 460;
const attrLocationChartHeight = 400;

getattributedLocationData().then((data) => {
  // Define X axis Scale
  const attrLocationChartXScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d[1].length_ratio))])
    .range([0, attrLocationChartWidth - XofattrLocationChartMargin.left]);

  // Define Y axis Scale
  const attrLocationChartYScale = d3
    .scaleBand()
    .range([0, attrLocationChartHeight])
    .domain(data.map((d) => d[0]))
    .padding(0.1);

  // Draw Y axis
  attrLocationChartSVG
    .append("g")
    .call(d3.axisLeft(attrLocationChartYScale))
    .attr("transform", `translate(${XofattrLocationChartMargin.left},0)`);

  // Draw Bar
  attrLocationChartSVG
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", XofattrLocationChartMargin.left)
    .attr("y", (d) => attrLocationChartYScale(d[0]))
    .attr("width", (d) => attrLocationChartXScale(d[1].length_ratio))
    .attr("height", attrLocationChartYScale.bandwidth())
    .attr("fill", (d) => (d[0] === "Antarctica" ? "#3a7dce" : "#d9d9d9"));

  // Draw Label
  attrLocationChartSVG
    .selectAll(".text")
    .data(data)
    .enter()
    .append("text")
    .text((d) => Math.round(d[1].length_ratio * 100) + "%")
    .attr("x", (d) => XofattrLocationChartMargin.left + attrLocationChartXScale(d[1].length_ratio) + 15)
    .attr("y", (d) => attrLocationChartYScale(d[0]) + 35)
    .attr("fill", (d) => (d[0] === "Antarctica" ? "#3a7dce" : "#999999"));
});

// Text
const attrLocationTextDiv = attrLocationDivInnerDiv.append("div");
attrLocationTextDiv.append("span").text("71% is from Antarctica").style("font-size", "72px").style("color", "#3a7dce");

// ------------------------------
// Reason One
// ------------------------------

const antarcticaReasonOneDiv = body
  .append("div")
  .attr("id", "antarctica_reason_one")
  .attr("class", "step")
  .style("height", "100vh")
  .style("background-color", "#3a7dceff");

const antarcticaMapDiv = antarcticaReasonOneDiv
  .append("div")
  .style("display", "flex")
  .style("flex-direction", "row")
  .style("height", "90vh");

const antarcticaMapSVG = drawAntarcticaMap(antarcticaMapDiv);

function drawAntarcticaMap(div) {
  const antarcticaMapSVG = div
    .append("svg")
    .attr("id", "map")
    .attr("viewBox", "0 0 1000 1000")
    .style("flex", "1")
    .style("height", "100%")
    .style("width", "100%");

  const svgMap = antarcticaMapSVG.append("g").attr("id", "map").attr("transform", "translate(155, 350) scale(0.9)");

  d3.json("./data/antarctica_wgs84.geojson").then((AntarcticaGeoJSON) => {
    const projection = d3.geoStereographic().center([135, -82.8628]).scale(1300).precision(0.1);
    const path = d3.geoPath().projection(projection);

    svgMap
      .selectAll("path.land")
      .data(AntarcticaGeoJSON.features)
      .enter()
      .append("path")
      .attr("fill", "white")
      .attr("class", "land")
      .attr("d", path);
  });

  return antarcticaMapSVG;
}

const circleCoordinates = [
  { cx: 200, cy: 200 },
  { cx: 270, cy: 200 },
  { cx: 340, cy: 200 },
  { cx: 165, cy: 270 },
  { cx: 235, cy: 270 },
  { cx: 305, cy: 270 },
  { cx: 375, cy: 270 },
  { cx: 445, cy: 270 },
  { cx: 130, cy: 340 },
  { cx: 200, cy: 340 },
  { cx: 270, cy: 340 },
  { cx: 340, cy: 340 },
  { cx: 410, cy: 340 },
  { cx: 480, cy: 340 },
  { cx: -55, cy: 410 },
  { cx: 25, cy: 410 },
  { cx: 95, cy: 410 },
  { cx: 165, cy: 410 },
  { cx: 235, cy: 410 },
  { cx: 305, cy: 410 },
  { cx: 375, cy: 410 },
  { cx: 445, cy: 410 },
  { cx: 515, cy: 410 },
  { cx: 585, cy: 410 },
  { cx: -80, cy: 480 },
  { cx: -10, cy: 480 },
  { cx: 270, cy: 480 },
  { cx: 340, cy: 480 },
  { cx: 410, cy: 480 },
  { cx: 480, cy: 480 },
  { cx: 550, cy: 480 },
  { cx: 305, cy: 550 },
  { cx: 375, cy: 550 },
  { cx: 445, cy: 550 },
  { cx: 515, cy: 550 },
  { cx: 585, cy: 550 },
  { cx: 340, cy: 620 },
  { cx: 410, cy: 620 },
  { cx: 480, cy: 620 },
  { cx: 550, cy: 620 },
  { cx: 375, cy: 690 },
  { cx: 445, cy: 690 },
  { cx: 515, cy: 690 },
];

antarcticaMapSVG
  .selectAll("circle")
  .data(circleCoordinates)
  .enter()
  .append("circle")
  .style("cx", (d) => d.cx + 300)
  .style("cy", (d) => d.cy + 75)
  .style("r", 6)
  .style("fill", "#595959ff");

const antarcticaReasonOneTextDiv = antarcticaMapDiv
  .append("div")
  .attr("id", "map")
  .style("flex", "1")
  .style("text-align", "center")
  .style("margin-top", "250px");

antarcticaReasonOneTextDiv.append("h1").text("Reason #1").style("color", "white");
antarcticaReasonOneTextDiv.append("h1").text("Easier to Spot").style("color", "white").style("font-size", "72px");
antarcticaReasonOneTextDiv
  .append("h1")
  .text("Meteorites")
  .style("color", "white")
  .style("font-size", "72px")
  .style("margin", "0 0px");

// ------------------------------
// Reason Two
// ------------------------------

const antarcticaReasonTwoDiv = body
  .append("div")
  .attr("id", "antarctica_reason_two")
  .attr("class", "step")
  .style("height", "100vh")
  .style("background-color", "#3a7dceff");

const antarcticaMapTwoDiv = antarcticaReasonTwoDiv
  .append("div")
  .style("display", "flex")
  .style("flex-direction", "row")
  .style("height", "90vh");

const antarcticaMapSVGTwo = drawAntarcticaMap(antarcticaMapTwoDiv);

// ------------------------------
// Scrollama Setup
// ------------------------------

const scroller = scrollama();

scroller
  .setup({
    step: ".step",
  })
  .onStepEnter((response) => {
    // console.log("onStepEnter");
    // console.log(response);
  })
  .onStepExit((response) => {
    // console.log("onStepExit");
    // console.log(response);
  });
