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
    "id": "ld1-1643406126934-1643406143354-0",
    "title": "ALH 77165,4",
    "collection_date": "1977",
    "latitude": "-76.7139",
    "longitude": "159.424",
    "weight": "0.083 g",
    "link": "http://n2t.net/ark:/65665/314c804f4-6e8e-4569-b787-44eb3a025c84"
  },
```
See all data [here](https://github.com/takumanken/major-studio-1-code/blob/main/quantitave_data/mockup/data/data.json)