# Interactive Data Visualization Sketches

## Meteorites in Antarctica - Interactivity Enhancement

This project aims to enhance the previous [Meteorites in Antarctica](https://takumanken.github.io/major-studio-1-code/quantitave_data/code/app/) visualization by adding three new interactive features:

### Scope of Enhancement

#### 1. Interactive Filter for Histogram
Add filtering capabilities to the histograms on the left (Weight and Collected Year) to allow users to explore meteorites based on specific criteria of interest.

#### 2. Zoom-In Feature
Introduce a zoom-in functionality on the map to enable users to closely examine specific areas, facilitating a more detailed exploration of meteorite distribution.

#### 3. Antarctica Landmass Contour
Add contour lines to represent elevation across Antarctica, providing users with additional geographic context to better understand meteorite collection locations.

![1](https://github.com/takumanken/major-studio-1-code/blob/main/interactive/sketch/image/meteorite.png)

### Considerations
Data Availability: Displaying Antarctica’s elevation contours may require advanced geoprocessing tools, such as QGIS, to prepare the data accurately for integration.
Interactive Filter Implementation: Implementing the filter to align precisely with the design may require advanced coding techniques.

## Uncover the Moment - Interactivity Enhancement

This project aims to enhance the previous [Uncover the Moment](https://takumanken.github.io/major-studio-1-code/qualitative_data/app/code/index.html) visualization by adding new interactive features.

### Scope of Enhancement

### 1. Cover Page: Adding Animation Effect to the title
Add animation effects to the main and subtitles on the cover page to draw users’ attention. 
![](https://github.com/takumanken/major-studio-1-code/blob/main/interactive/sketch/image/portrait_1.png)

### 2. Gallery Page: Adding Sort Control and Scrolling Effect
Implement a sorting control on the gallery page to improve the user experience when searching and browsing. Also, smooth scrolling effect will be added to create a more interactive and fluid user experience.
![](https://github.com/takumanken/major-studio-1-code/blob/main/interactive/sketch/image/portrait_2.png)

### 3. Gallery Page: Adding number of hits of filter
Display the number of results or "hits" that match the current filter criteria, allowing users to see how many portraits will be shown before they apply a filter.
![](https://github.com/takumanken/major-studio-1-code/blob/main/interactive/sketch/image/portrait_3.png)

### 4. All: Responsive Design
Implement a fully responsive design to ensure an optimal viewing experience across all devices, with particular attention to smartphone users. This will enhance accessibility and usability, allowing seamless interaction with the website on different screen sizes.

## Animal Explorer

### Overview
This project will create a data visualization showcasing several animal classifications, including size, lifespan, sleep habits, and conservation status. Animal photos will be sourced from [Smithsonian's National Zoo & Conservation Biology Institute](https://www.si.edu/search/collection-images?edan_q=&edan_fq%5B0%5D=data_source%3A%22Smithsonian%27s%20National%20Zoo%20%26%20Conservation%20Biology%20Institute%22&edan_fq%5B1%5D=media_usage%3A%22CC0%22) and animal metadata (used for the classifications) will be gathered by scraping [animal descriptions from Smithsonian's National Zoo.](https://nationalzoo.si.edu/animals/abyssinian-ground-hornbill). 

![](https://github.com/takumanken/major-studio-1-code/blob/main/interactive/sketch/image/portrait_3.png)

### Visualization Idea
- The data will be displayed in a dot plot format, where each dot represents an animal species, with a representative photo centered within each dot.
- Dots will have borders that indicate the animal type by color: Amphibians, Birds, Fish, Invertebrates, Mammals, or Reptiles.
- Each dot will cluster around groups that correspond to the selected classification criteria (e.g., size, lifespan).
- Each dot will be gathered around corresponding group based on the selected criteria.

### Interactivity & Animation
- Filter by Animal Type: Users can filter animals by their type (e.g., only view mammals or birds).
- Criteria Selection: Users can change the classification criteria to view animals grouped by different attributes, such as size or lifespan.
- Dynamic Animation: Dots will animate as criteria or filter selections change.

### Data Points
The visualization will include approximately 318 animal species based on available descriptions from the Smithsonian's National Zoo.

### Considerations/Challenges
- Metadata Formatting: The metadata on the Smithsonian description pages is unstandardized. An efficient method for categorizing and classifying this data will be necessary.
- Naming Consistency: Inconsistencies exist in naming conventions for animal species across sources. Efficient methods for identifying and matching species data between the photo collection and zoo descriptions are needed to ensure accurate data integration.