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

    // Create the portrait Div
    const portraitSection = container.append("div")
        .attr("id", "portrait-section");

    // Portrait image
    portraitSection.append("img")
        .attr("id", "portrait-image")
        .attr("src", portraitData.imageLink)
        .attr("alt", portraitData.name + " Portrait");

    // Info Section Div
    const infoSection = container.append("div")
        .attr("id", "info-section");
        
    // Name and period Div
    const nameDiv = infoSection.append("div")
        .attr("id", "name-div");

    // Name and Period
    nameDiv.append("span")
        .attr("id", "name")
        .text(portraitData.name.toUpperCase());

    nameDiv.append("p")
        .attr("id", "period")
        .html(portraitData.period);

    // BasicInfo Div (Gender, Age, Portrait Year, Artist)
    const basicInfoDiv = infoSection.append("div")
        .attr("id", "basicInfo");

    // Gender
    basicInfoDiv.append("div")
        .attr("class", "basicInfoItem")
        .attr("id", "gender")
        .html("<span class='categoryName'>GENDER</span>" + portraitData.sex);

    // Age
    basicInfoDiv.append("div")
        .attr("class", "basicInfoItem")
        .attr("id", "age")
        .html("<span class='categoryName'>AGE</span>" + portraitData.ageAtPortrait.ageInt);

    // Portrait Year
    basicInfoDiv.append("div")
        .attr("class", "basicInfoItem")
        .attr("id", "portraitYear")
        .html("<span class='categoryName'>YEAR</span>" + portraitData.portraitYear.yearInt)

    // Artist
    basicInfoDiv.append("div")
        .attr("class", "basicInfoItem")
        .attr("id", "artist")
        .html("<span class='categoryName'>ARTIST</span>" + portraitData.artistName)

    // AI Summary Div
    const aiSummaryDiv = infoSection.append("div")
        .attr("id", "aiSummary");

    // AI Summary Title Div
    const aiSummaryTitleDiv = aiSummaryDiv.append("div")
        .attr("id", "aiSummaryTitle");

    // AI Image
    aiSummaryTitleDiv.append("img")
        .attr("id", "aiIcon")
        .attr("src", "../image/ai_icon.png");

    // AI Summary Title
    aiSummaryTitleDiv.append("text")
        .text("AI Summary");

    // Source
    aiSummaryTitleDiv.append("text")
        .attr("id", "source")
        .html(`Source: <a href='${portraitData.wikiURL}' target='_blank' style='color: #007791;'>Wikipedia</a>`)
        .style("flex", "1")
        .style("font-size", "10px")
        .style("text-align", "right")
        .style("padding-top", "10px")
        .style("color", "gray");

    // AI Summary Content
    const aiSummaryContentsDiv = aiSummaryDiv.append("div")
        .attr("id", "ai-summary-contents");

    aiSummaryContentsDiv.append("h4")
        .text("ABOUT");

    aiSummaryContentsDiv.append("p")
        .html(portraitData.description);

    aiSummaryContentsDiv.append("h4")
        .text("MOMEMNT OF THE PORTRAIT");

    aiSummaryContentsDiv.append("p")
        .text(portraitData.portraitMoment);

    // Life Events Timeline
    aiSummaryContentsDiv.append("h4")
        .text("LIFE EVENTS");

    const element = document.querySelector('#ai-summary-contents > h4:nth-child(5)');
    const rect = element.getBoundingClientRect();
    const y = rect.top + window.scrollY; // Add window.scrollY to account for any scrolling

    const svgWidth = 625;
    const svgHeight = 225 + (590 - y);

    const timelineSVG = aiSummaryContentsDiv.append("svg")
        .attr("id", "timelineSVG")
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

    const portraitYearDescription = "This portrait was drawn";

    portraitData.mainEvents.push({
        year: portraitData.portraitYear.yearInt,
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
        
        timelineSVG.append("circle")
            .attr("cx", timeLineX)
            .attr("cy", d.dotY)
            .attr("r", 6)
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

        let age = d.year - portraitData.birthYear;

        timelineSVG.append("text")
            .html(`
                <tspan style="font-weight:bold">${d.year}</tspan>  (${age} y/o) : ${d.description}
            `)
            .attr("x", descriptionX)
            .attr("y", d.descY + 5)
            .attr("fill", d.description == portraitYearDescription ? "#FFCD00" : "white")
            .style("font-size", "14px")
            .style("font-weight", "normal")
    });

});