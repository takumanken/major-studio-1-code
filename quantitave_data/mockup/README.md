# Meteorites in Antarctica
## Overview
This visualization allows users to explore the Antarctic meteorite collection based on a map UI.
The first view of this UI is to show the entire Antarctic and visualize the number of meteorites on the density heatmap, grouped by binned latitude and longitude. In addition, users can click on the density heatmap to see each instance on the screen.
This visualization uses the latitude and longitude metadata for the density map and also uses collection date, weight as filters.


## Mockup
### Dafault State
![Default State](https://github.com/takumanken/major-studio-1-code/blob/main/quantitave_data/mockup/image/default_state.png)

### When you select a specific data point
![Zoom-In](https://github.com/takumanken/major-studio-1-code/blob/main/quantitave_data/mockup/image/zoom_in.png)

## Data (As of September 19, 2024)
### Data Source
- Polygon Data: [U.S. National Ice Center](https://usicecenter.gov/Products/AntarcData)
- Meteorites: [Smithsonian Open Access](https://www.si.edu/openaccess)

### # of Data Point
45,223

### JSON Structure
```JSON
  {
    "id": "ld1-1643406126934-1643406141420-2",
    "title": "LEW 93887,2",
    "collection_date": "N/A",
    "latitude": "N/A",
    "longitude": "N/A",
    "weight": "N/A",
    "link": "http://n2t.net/ark:/65665/3cf5d9326-0f95-4ab8-b88c-7022119d0b65"
  },
```
See all data [here](https://github.com/takumanken/major-studio-1-code/blob/main/quantitave_data/mockup/data/data.json)