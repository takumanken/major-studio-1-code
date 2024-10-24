// Load the JSON file and process the data
d3.json('../data/data.json').then(data => {

    // Get the ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // Find the relevant portrait data
    const portraitData = data.find(item => item.id === id);
    if (!portraitData) {
        console.error("No data found for ID:", id);
        return;
    }

    // Set up the portrait container
    const container = d3.select("#portrait-container")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("padding", "0")
        .style("height", "87vh");

    // Create the portrait section
    const portraitSection = container.append("div")
        .attr("id", "portrait-section")
        .style("flex", "1")
        .style("padding", "0")
        .style("margin-left", "60px")
        .style("margin-right", "60px")
        .style("margin-top", "20px")
        .style("margin-bottom", "20px");

    portraitSection.append("img")
        .attr("id", "portrait-image")
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
        .style("font-family", "Libre Franklin")
        .style("color", "#ffffff")
        .style("margin-bottom", "10px");

    nameDiv.append("div")
        .html(portraitData.period)
        .style("font-size", "20px")
        .style("font-family", "Libre Franklin")
        .style("color", "#8D9194");

    // Basic information: Gender, Age, Portrait Year, Artist
    const basicInfoDiv = infoSection.append("div")
        .attr("id", "basicInfo")
        .style("flex", "1")
        .style("display", "flex")
        .style("width", "100%")
        .style("margin-top", "25px")
        .style("margin-bottom", "10px")
        .style("margin-left", "0px");

    const basicInfoLeftDiv = basicInfoDiv.append("div")
        .style("flex", "4")
        .style("width", "100%");

    basicInfoLeftDiv.append("li")
        .html("<span class='categoryName'>Gender : </span><strong>" + portraitData.sex + "</strong>")
        .style("font-family", "Libre Franklin")
        .style("margin", "10px")
        .style("font-size", "18px");

    const rx = /[0-9]{4}/g;
    const portraitYear = rx.exec(portraitData.portraiteYear);
    const birthYear = d3.min(portraitData.mainEvents, d => d.year);
    const ageAtPortrait = portraitYear - birthYear;

    basicInfoLeftDiv.append("li")
        .html("<span class='categoryName'>Age at Portrait : </span><strong>" + ageAtPortrait + "</strong>")
        .style("font-family", "Libre Franklin")
        .style("margin", "10px")
        .style("font-size", "20px");

    const basicInfoRightDiv = basicInfoDiv.append("div")
        .style("flex", "6")
        .style("margin-left", "10px")
        .style("width", "100%");

    basicInfoRightDiv.append("li")
        .html("<span class='categoryName'>Portrait Year : </span><strong>" + portraitData.portraiteYear + "</strong>")
        .style("font-family", "Libre Franklin")
        .style("margin", "10px")
        .style("font-size", "20px");

    basicInfoRightDiv.append("li")
        .html("<span class='categoryName'>Artist : </span><strong>" + portraitData.artistName + "</strong>")
        .style("font-family", "Libre Franklin")
        .style("margin", "10px")
        .style("font-size", "20px");

    // AI Summary section
    const aiSummaryDiv = infoSection.append("div")
        .attr("id", "aiSummary")
        .style("flex", "10");

    // AI Summary Title
    const aiSummaryTitleDiv = aiSummaryDiv.append("div")
        .attr("id", "aiSummaryTitle")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("margin-bottom", "5px");

    const aiSummaryTitleTextDiv = aiSummaryTitleDiv.append("div")
        .style("flex", "1")

    aiSummaryTitleTextDiv.append("img")
        .attr("src", "../image/ai_icon.png")
        .attr("alt", "AI Icon")
        .style("width", "25px")
        .style("height", "25px")
        .style("transform", "translate(0px, 6px)");

    aiSummaryTitleTextDiv.append("text")
        .text(" AI Summary")
        .style("font-family", "Libre Franklin")
        .style("font-size", "18px")
        .style("margin-top", "0px")
        .style("color", "white");

    const aiSummaryTitleSourceDiv = aiSummaryTitleDiv.append("div")
        .style("flex", "1")
        .style("text-align", "right")
        .style("margin-right", "50px")
        .style("margin-top", "10px");

    aiSummaryTitleSourceDiv.append("text")
        .html(`Source: <a href='${portraitData.wikiURL}' target='_blank' style='color: #007791;'>Wikipedia</a>`)
        .style("font-family", "Libre Franklin")
        .style("font-size", "10px")
        .style("margin-top", "0px")
        .style("margin-right", "5px")
        .style("color", "gray");

    // AI Summary Content
    const aiSummaryContentsDiv = aiSummaryDiv.append("div")
        .attr("id", "ai-summary-contents")
        .style("background-color", "#002554")
        .style("margin-right", "50px")
        .style("margin-top", "0px")
        .style("padding", "0")
        .style("height", "535px")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("border-radius", "10px");

    aiSummaryContentsDiv.append("h4").text("About")
        .style("font-family", "Libre Franklin")
        .style("font-size", "18px")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    aiSummaryContentsDiv.append("p")
        .html(portraitData.description)
        .style("font-size", "16px")
        .style("margin-top", "5px")
        .style("margin-bottom", "10px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px")
        .style("line-height", "1.2");

    aiSummaryContentsDiv.append("h4")
        .text("Moment of the Portrait")
        .style("font-family", "Libre Franklin")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    aiSummaryContentsDiv.append("p")
        .text(portraitData.portraitMoment)
        .style("font-size", "16px")
        .style("margin-top", "5px")
        .style("margin-bottom", "10px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px")
        .style("line-height", "1.2");

    // Life Events Timeline
    aiSummaryContentsDiv.append("h4").text("Life Events")
        .style("font-family", "Libre Franklin")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("color", "white")
        .style("margin-top", "20px")
        .style("margin-bottom", "0px")
        .style("margin-left", "20px")
        .style("margin-right", "20px")
        .style("padding", "0px");

    const element = document.querySelector('#ai-summary-contents > h4:nth-child(5)');
    const rect = element.getBoundingClientRect();
    const y = rect.top + window.scrollY; // Add window.scrollY to account for any scrolling
    console.log('Y-coordinate relative to the document:', y);

    const svgWidth = 625;
    const svgHeight = 225 + (570 - y);

    const timelineSVG = aiSummaryContentsDiv.append("svg")
        .attr("id", "timeline-svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("padding-top", "10px")
        .style("padding-bottom", "10px")
        .style("padding-left", "20px");

    const timeLineX = 40;
    const timeLineStartY = 10;
    const timeLineEndY = svgHeight - 10;
    const descriptionX = 110;

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

    const portraitYearDescription = "This portrait was drawn.";

    portraitData.mainEvents.push({
        year: parseInt(portraitYear),
        description: portraitYearDescription
    });

    let sortedmainEvents = portraitData.mainEvents.sort((a, b) => a.year - b.year);
    let yearCoodinate = portraitData.mainEvents.map(d => scale(d.year));

    // Calculate Coordinates makes years look good
    let thresholdMinimumGap = 20;

    function calculateMinGap(array) {
    let minGap = Infinity;
    let minIndex = -1;
    for (let i = 1; i < array.length; i++) {
        let gap = array[i] - array[i - 1];
        if (gap < minGap) {
        minGap = gap;
        minIndex = i;
        }
    }
    return { minGap, minIndex };
    }

    let { minGap, minIndex } = calculateMinGap(yearCoodinate);
    let adjustedYearCoodinate = yearCoodinate.slice();

    // While thresholdMinimumGap is greater than minGap, adjust the values in the array
    while (thresholdMinimumGap > minGap) {
    let prevIndex = minIndex - 1;
    let followingIndex = minIndex;

    if (adjustedYearCoodinate[prevIndex] === timeLineStartY) {
        adjustedYearCoodinate[followingIndex] += 2;
    } else if (adjustedYearCoodinate[followingIndex] === timeLineEndY) {
        adjustedYearCoodinate[prevIndex] -= 2;
    } else {
        adjustedYearCoodinate[followingIndex] += 1;
        adjustedYearCoodinate[prevIndex] -= 1;
    }

    ({ minGap, minIndex } = calculateMinGap(adjustedYearCoodinate));
    }

    sortedmainEvents.forEach((d, i) => {
        d.dotY = yearCoodinate[i];
        d.descY = adjustedYearCoodinate[i];
    });

    // Draw the timeline
    sortedmainEvents.forEach((d, i) => {
        // 
        timelineSVG.append("circle")
            .attr("cx", timeLineX)
            .attr("cy", d.dotY)
            .attr("r", 5)
            .attr("fill", d.description == portraitYearDescription ? "#FFCD00" : "white");

        timelineSVG.append("line")
            .attr("x1", timeLineX)
            .attr("y1", d.dotY)
            .attr("x2", timeLineX + 30)
            .attr("y2", d.descY)
            .attr("stroke", d.description == portraitYearDescription ? "#FFCD00" : "white")
            .attr("stroke-width", "1");

        timelineSVG.append("line")
            .attr("x1", timeLineX + 30)
            .attr("y1", d.descY)
            .attr("x2", descriptionX - 10)
            .attr("y2", d.descY)
            .attr("stroke", d.description == portraitYearDescription ? "#FFCD00" : "white")
            .attr("stroke-width", "1");


        let age = d.year - birthYear;

        timelineSVG.append("text")
            .attr("x", descriptionX)
            .attr("y", d.descY + 5)
            .text(`${d.year} (${age}) : ${d.description}`)
            .style("font-size", "13px")
            .style("font-weight", d.description == portraitYearDescription ? "bold" : "normal")
            .attr("fill", d.description == portraitYearDescription ? "#FFCD00" : "white")
            .style("font-family", "Libre Franklin");
    });

});