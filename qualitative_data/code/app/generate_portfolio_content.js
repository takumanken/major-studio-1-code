// Load the JSON file and process the data
d3.json('../../data/finalized_data.json').then(data => {

    // Get the ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // Find the relevant portrait data
    const portraitData = data.find(item => item.id === id);
    if (!portraitData) {
        console.error("No data found for ID:", id);
        return;
    }

    // Set up the portfolio container
    const container = d3.select("#portfolio-container")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("padding", "0")
        .style("height", "87vh");

    // Create the portrait section
    const portraitSection = container.append("div")
        .attr("id", "portrait-section")
        .style("flex", "1")
        .style("padding", "0")
        .style("margin-left", "100px")
        .style("margin-right", "100px")
        .style("margin-top", "40px")
        .style("margin-bottom", "40px")
        .style("background-color", "black");

    portraitSection.append("img")
        .attr("id", "portfolio-image")
        .attr("src", portraitData.imageLink)
        .attr("alt", portraitData.name + " Portrait")
        .style("max-width", "100%")
        .style("max-height", "100%")
        .style("margin", "auto auto")
        .style("border-radius", "10px")
        .style("background-color", "black");

    portraitSection.style("display", "flex")
        .style("align-items", "center");

    // Create the information section
    const infoSection = container.append("div")
        .attr("id", "info-section")
        .style("flex", "1")
        .style("padding", "20px")
        .style("border-radius", "10px")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "stretch");

    // Name and period section
    const nameDiv = infoSection.append("div")
        .attr("id", "name")
        .style("flex", "1")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px");

    nameDiv.append("span")
        .text(portraitData.name)
        .style("font-size", "36px")
        .style("font-family", "Minion Pro")
        .style("color", "#ffffff")
        .style("margin-bottom", "10px");

    nameDiv.append("div")
        .html(portraitData.period)
        .style("font-size", "20px")
        .style("font-family", "Minion Pro")
        .style("color", "#8D9194");

    // Basic information: Gender, Age, Portrait Year, Artist
    const basicInfoDiv = infoSection.append("div")
        .attr("id", "basicInfo")
        .style("flex", "1")
        .style("display", "flex")
        .style("width", "100%")
        .style("margin-top", "25px")
        .style("margin-bottom", "10px")
        .style("margin-left", "20px");

    const basicInfoLeftDiv = basicInfoDiv.append("div")
        .style("flex", "3")
        .style("margin-left", "40px")
        .style("width", "100%");

    basicInfoLeftDiv.append("li")
        .html("Gender : <strong>" + portraitData.sex + "</strong>")
        .style("font-family", "Minion Pro")
        .style("margin", "10px")
        .style("font-size", "20px");

    const rx = /[0-9]{4}/g;
    const portraitYear = rx.exec(portraitData.portraiteYear);
    const birthYear = d3.min(portraitData.mainEvents, d => d.year);
    const ageAtPortrait = portraitYear - birthYear;

    basicInfoLeftDiv.append("li")
        .html("Age at Portrait : <strong>" + ageAtPortrait + "</strong>")
        .style("font-family", "Minion Pro")
        .style("margin", "10px")
        .style("font-size", "20px");

    const basicInfoRightDiv = basicInfoDiv.append("div")
        .style("flex", "7")
        .style("margin-left", "20px")
        .style("width", "100%");

    basicInfoRightDiv.append("li")
        .html("Portrait Year : <strong>" + portraitData.portraiteYear + "</strong>")
        .style("font-family", "Minion Pro")
        .style("margin", "10px")
        .style("font-size", "20px");

    basicInfoRightDiv.append("li")
        .html("Artist : <strong>" + portraitData.artistName + "</strong>")
        .style("font-family", "Minion Pro")
        .style("margin", "10px")
        .style("font-size", "20px");

    // AI Summary section
    const aiSummaryDiv = infoSection.append("div")
        .attr("id", "aiSummary")
        .style("flex", "10");

    // AI Summary Title
    const aiSummaryTitleDiv = aiSummaryDiv.append("div")
        .attr("id", "aiSummaryTitle");

    aiSummaryTitleDiv.append("img")
        .attr("src", "./ai_icon.png")
        .attr("alt", "AI Icon")
        .style("width", "25px")
        .style("height", "25px")
        .style("transform", "translate(0px, 6px)");

    aiSummaryTitleDiv.append("text")
        .text(" AI Summary")
        .style("font-family", "Minion Pro")
        .style("font-size", "20px")
        .style("margin-top", "0px")
        .style("color", "white");

    // AI Summary Content
    const aiSummaryContentsDiv = aiSummaryDiv.append("div")
        .attr("id", "ai-summary-contents")
        .style("background-color", "#002554")
        .style("margin-right", "50px")
        .style("margin-top", "0px")
        .style("padding", "10px")
        .style("height", "88%")
        .style("display", "flex")
        .style("flex-direction", "column");

    const aiSummaryAboutDiv = aiSummaryContentsDiv.append("div")
        .attr("id", "about")
        .style("height", "125px");

    aiSummaryAboutDiv.append("h4").text("About")
        .style("font-family", "Minion Pro")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    aiSummaryAboutDiv.append("p")
        .html(portraitData.description)
        .style("font-size", "16px")
        .style("margin-top", "5px")
        .style("margin-bottom", "10px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px")
        .style("line-height", "1.2");

    const aiSummaryMomentDiv = aiSummaryContentsDiv.append("div")
        .attr("id", "moment")
        .style("height", "125px");

    aiSummaryMomentDiv.append("h4").text("Moment of the Portrait")
        .style("font-family", "Minion Pro")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    aiSummaryMomentDiv.append("p")
        .text(portraitData.portraitMoment)
        .style("font-size", "16px")
        .style("margin-top", "5px")
        .style("margin-bottom", "10px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px")
        .style("line-height", "1.2");

    // Life Events Timeline
    const aiSummaryEventsDiv = aiSummaryContentsDiv.append("div")
        .attr("id", "timeline")
        .style("flex", "5")
        .style("height", "350px");

    aiSummaryEventsDiv.append("h4").text("Life Events")
        .style("font-family", "Minion Pro")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    const svgWidth = 625;
    const svgHeight = 225;

    const timelineSVG = aiSummaryEventsDiv.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("padding-top", "10px")
        .style("padding-bottom", "10px")
        .style("padding-left", "20px");

    const timeLineX = 40;
    const timeLineStartY = 10;
    const timeLineEndY = svgHeight - 10;
    const descriptionX = 150;

    timelineSVG.append("line")
        .attr("x1", timeLineX)
        .attr("y1", timeLineStartY)
        .attr("x2", timeLineX)
        .attr("y2", timeLineEndY)
        .attr("stroke", "white")
        .attr("stroke-width", "2");

    const minYear = d3.min(portraitData.mainEvents, d => d.year);
    const maxYear = d3.max(portraitData.mainEvents, d => d.year);

    const scale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([timeLineStartY, timeLineEndY]);

    portraitData.mainEvents.push({
        year: portraitYear,
        description: "This portrait was drawn."
    });

    portraitData.mainEvents.forEach((d, i) => {
        timelineSVG.append("circle")
            .attr("cx", timeLineX)
            .attr("cy", scale(d.year))
            .attr("r", 6)
            .attr("fill", d.year == portraitYear ? "#FFCD00" : "white");

        timelineSVG.append("line")
            .attr("x1", timeLineX)
            .attr("y1", scale(d.year))
            .attr("x2", descriptionX - 10)
            .attr("y2", scale(d.year))
            .attr("stroke", d.year == portraitYear ? "#FFCD00" : "white")
            .attr("stroke-width", "1");

        let age = d.year - birthYear;

        timelineSVG.append("text")
            .attr("x", descriptionX)
            .attr("y", scale(d.year) + 5)
            .text(`${d.year} (${age}) : ${d.description}`)
            .style("font-size", "14px")
            .attr("fill", d.year == portraitYear ? "#FFCD00" : "white")
            .style("font-family", "Minion Pro");
    });

});
