// -------------------
// State Object
// -------------------

let stateObject = {
    genre: [],
    gender: [],
    portraitYear: [],
    age: [],
    selfPortrait: [],
}

async function initializeFilter(data) {

    // Aggregate counts for each filter
    function aggregateCounts(data, accessor) {
        const rollup = d3.rollups(
            data,
            v => v.length,
            accessor
        );
        const sorted = rollup.sort((a, b) => b[1] - a[1]);
        return sorted.map(d => d[0]);
    }
    
    // Populate filter options
    function populateFilterOptions(data, elementId) {
        d3.select(`#${elementId}`)
            .selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);
    }

    aggGenre        = aggregateCounts(data, d => d.categories[0]);
    aggGender       = aggregateCounts(data, d => d.sex);
    aggPortraitYear = aggregateCounts(data, d => d.portraitYear.yearGroup);
    aggAge          = aggregateCounts(data, d => d.ageAtPortrait.ageGroup);
    aggSelfPortrait = aggregateCounts(data, d => d.isSelfPortrait);

    // Update State Object
    stateObject.genre        = aggGenre;
    stateObject.gender       = aggGender;
    stateObject.portraitYear = aggPortraitYear.sort();
    stateObject.age          = aggAge.sort();
    stateObject.selfPortrait = aggSelfPortrait.sort().reverse();

    // Populate filter options
    populateFilterOptions(stateObject.genre, "genreFilter");
    populateFilterOptions(stateObject.gender, "genderFilter");
    populateFilterOptions(stateObject.portraitYear, "yearFilter");
    populateFilterOptions(stateObject.age, "ageFilter");
    populateFilterOptions(stateObject.selfPortrait, "sfFilter");

}

function updateStateObject() {

    function getFilterValues(elementId) {
        return Array.from(document.getElementById(elementId).selectedOptions)
            .map(option => option.value.split(" (")[0]);
    }

    // Update state object
    const currentGenre = getFilterValues("genreFilter");
    if (currentGenre.length > 0) stateObject.genre = currentGenre;

    const currentGender = getFilterValues("genderFilter");
    if (currentGender.length > 0) stateObject.gender = currentGender;
    
    const currentPortraitYear = getFilterValues("yearFilter");
    if (currentPortraitYear.length > 0) stateObject.portraitYear = currentPortraitYear;

    const currentAge = getFilterValues("ageFilter");
    if (currentAge.length > 0) stateObject.age = currentAge;

    const currentSelfPortrait = getFilterValues("sfFilter");
    if (currentSelfPortrait.length > 0) stateObject.selfPortrait = currentSelfPortrait;

}

function updateData(data) {

    updateStateObject();

    console.log("updateData", stateObject);

    // Filter function
    const filteredData = data.filter(d => 
        stateObject.gender.includes(d.sex)
        && stateObject.genre.includes(d.categories[0])
        && stateObject.portraitYear.includes(d.portraitYear.yearGroup)
        && stateObject.age.includes(d.ageAtPortrait.ageGroup)
        && stateObject.selfPortrait.includes(d.isSelfPortrait)
    );

    // let stateObject = {
    //     genre: [],
    //     gender: [],
    //     portraitYear: [],
    //     age: [],
    //     selfPortrait: [],
    // }
    
    // Update gallery
    drawGallery(filteredData);

}

// -------------------
// Data Loading
// -------------------
async function getAllGalleryData() {
    const response = await fetch('../data/data.json');
    return await response.json();
}

// -------------------
// Drawing Gallery
// -------------------
function drawGallery(data) {
    const portraitWidth = 250;
    const gapBetweenPortraits = 5;

    d3.select("#portrait-gallery").selectAll("*").remove();

    const gallery = d3.select("#portrait-gallery")
        .style("display", "grid")
        .style("grid-template-columns", `repeat(auto-fit, minmax(${portraitWidth}px, 1fr))`)
        .style("gap", `${gapBetweenPortraits}px`)
        .style("width", "90%")
        .style("margin", "0 auto")
        .style("flex", "1");

    const portraits = gallery.selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "portrait-item")
        .style("position", "relative")
        .style("text-align", "center")
        .on("click", (event, d) => {
            window.location.href = `portrait.html?id=${d.id}`;
        })
        .on("mouseover", function(event, d) {
            d3.select(this).select("p")
                .style("visibility", "visible")
                .style("opacity", "1");
            d3.select(this).select("img")
                .style("filter", "brightness(0.5)");
        })
        .on("mouseout", function() {
            d3.select(this).select("p")
                .style("visibility", "hidden")
                .style("opacity", "0");
            d3.select(this).select("img")
                .style("filter", "none");
        });

    portraits.append("img")
        .attr("src", d => `../image/thumbnails/${d.id}.jpg`)
        .attr("class", "portrait-image")
        .style("width", `${portraitWidth}px`)
        .style("height", "400px")
        .style("object-fit", "cover")
        .style("transition", "filter 0.25s ease-in-out");

    portraits.append("p")
        .text(d => d.name.toUpperCase())
        .style("position", "absolute")
        .attr("class", "portrait-name")
        .style("top", "50%")
        .style("left", "50%")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("margin", "0")
        .style("transform", "translate(-50%, -50%)")
        .style("visibility", "hidden")
        .style("opacity", "0")
        .style("transition", "visibility 0s, opacity 0.25s ease-in-out");
}

// -------------------
// Helper Functions
// -------------------
function addScrollEventToToggleHeaderFooter() {
    
    let isScrolling;
    const header = d3.select("#header");
    const footer = d3.select("#footer");

    d3.select(window).on("scroll", () => {
        // Clear the previous timeout
        clearTimeout(isScrolling);

        // Hide header and footer while scrolling
        header.classed("hidden", true);
        footer.classed("hidden", true);

        // Show header and footer again after scrolling stops
        isScrolling = setTimeout(() => {
            header.classed("hidden", false);
            footer.classed("hidden", false);
        }, 500);
    });
}

// -------------------
// Main
// -------------------

async function init() {
    
    const data = await getAllGalleryData();
    drawGallery(data);
    await initializeFilter(data);
    d3.selectAll(".filter").on("change", () => updateData(data));
    addScrollEventToToggleHeaderFooter();
}

init();
