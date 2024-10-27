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

async function InitializeStateObject(data) {
    stateObject.genre        = aggregateCounts(data, d => d.categories[0]);
    stateObject.gender       = aggregateCounts(data, d => d.sex);
    stateObject.portraitYear = aggregateCounts(data, d => d.portraitYear.yearGroup).sort();
    stateObject.age          = aggregateCounts(data, d => d.ageAtPortrait.ageGroup).sort();
    stateObject.selfPortrait = aggregateCounts(data, d => d.isSelfPortrait).sort().reverse();
}

function aggregateCounts(data, accessor) {
    const rollup = d3.rollups(
        data,
        v => v.length,
        accessor
    );
    const sorted = rollup.sort((a, b) => b[1] - a[1]);
    return sorted.map(d => `${d[0]} (${d[1]})`);
}

// -------------------
// Data Loading
// -------------------
async function getGalleryData() {
    const response = await fetch('../data/data.json');
    return await response.json();
}

// -------------------
// Drawing Gallery
// -------------------
function drawGallery(data) {
    const portraitWidth = 250;
    const gapBetweenPortraits = 5;

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
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    window.addEventListener("scroll", () => {
        window.clearTimeout(isScrolling);
        header.classList.add('hidden');
        footer.classList.add('hidden');

        isScrolling = setTimeout(() => {
            header.classList.remove('hidden');
            footer.classList.remove('hidden');
        }, 500);
    });
}

// -------------------
// Main
// -------------------

async function main() {
    const data = await getGalleryData();
    console.log(data);
    await InitializeStateObject(data);
    addScrollEventToToggleHeaderFooter();
    drawGallery(data);
}

main();
