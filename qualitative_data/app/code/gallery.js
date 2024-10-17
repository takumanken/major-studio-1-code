// Use D3 to load the external JSON file
d3.json('../data/data.json')
    .then(data => {
        // Select the portrait gallery container
        const gallery = d3.select("#portrait-gallery")
            .style("display", "grid")
            .style("grid-template-columns", "repeat(auto-fit, minmax(200px, 1fr))")
            .style("gap", "50px")
            .style("padding-bottom", "50px");

        // Bind data to the gallery and create divs for each portrait
        const portraits = gallery.selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("class", "portrait-item")
            .style("text-align", "center")
            .on("click", (event, d) => {
                console.log("Clicked data object: ", d); // This should now be available
                if (d && d.id) {
                    window.location.href = `portrait.html?id=${d.id}`;
                } else {
                    console.error('ID property not found on data object.');
                }
            });

        // Add the image for each portrait
        portraits.append("img")
            .attr("src", d => "../image/thumbnails/" + d.id + ".jpg")
            .attr("alt", d => d.name)
            .style("width", "auto")
            .style("height", "200px")
            .style("object-fit", "cover")
            .style("border-radius", "10px");

        // Add the name for each portrait
        portraits.append("p")
            .text(d => d.name)
            .style("margin-top", "10px")
            .style("font-family", 'Minion Pro')
            .style("font-size", "16px")
            .style("font-weight", "regular");
    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });
