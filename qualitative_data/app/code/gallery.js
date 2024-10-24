// Add a scroll event listener to hide the header and footer when scrolling
function addScrollEventListener() {

        let isScrolling;
        const header = document.getElementById('header');
        const footer = document.getElementById('footer');

        onscroll = (event) => {

            window.clearTimeout(isScrolling);
            header.classList.add('hidden');
            footer.classList.add('hidden');

            isScrolling = setTimeout(() => {
                header.classList.remove('hidden');
                footer.classList.remove('hidden');
            }, 500);

        };
}

// Use D3 to load the external JSON file
const data = d3.json('../data/data.json')
    .then(data => {

        addScrollEventListener();

        // Select the portrait gallery container
        const portraitWidth = 250;
        const gapBetweenPortraits = 5;

        const gallery = d3.select("#portrait-gallery")
            .style("display", "grid")
            .style("grid-template-columns", `repeat(auto-fit, minmax(${portraitWidth}px, 1fr))`)
            .style("gap", `${gapBetweenPortraits}px`)
            .style("width", "90%")
            .style("margin", "0 auto")
            .style("flex", "1")

        // Bind data to the gallery and create divs for each portrait
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

        // Add the image for each portrait
        portraits.append("img")
            .attr("src", d => "../image/thumbnails/" + d.id + ".jpg")
            .attr("class", "portrait-image")
            .attr("alt", d => d.name)
            .style("width", `${portraitWidth}px`)
            .style("height", "400px")
            .style("object-fit", "cover")
            .style("transition", "filter 0.25s ease-in-out");

        // Add the text for each portrait
        portraits.append("p")
            .text(d => d.name)
            .style("position", "absolute")
            .attr("class", "portrait-name")
            .style("top", "50%")
            .style("left", "50%")
            .style("font-size", "1.5rem")
            .style("margin", "0")
            .style("transform", "translate(-50%, -50%)")
            .style("visibility", "hidden")
            .style("opacity", "0")
            .style("transition", "visibility 0s, opacity 0.25s ease-in-out");


    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });
