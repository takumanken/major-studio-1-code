# Project: Meteorites in Antarctica
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
    "id": "ld1-1643406126934-1643406131162-1",
    "title": "EET 92186,1",
    "date": {
      "label": "Collection Date",
      "content": "1992"
    },
    "geolocation": {
      "latitude": {
        "type": "decimal",
        "content": "-76.1833"
      },
      "longitude": {
        "type": "decimal",
        "content": "157.167"
      }
    },
    "weight": [
      {
        "label": "Weight",
        "content": "11.3 g"
      }
    ],
    "link": "http://n2t.net/ark:/65665/30926bb5c-d50c-48ae-a12d-71fa16a08aa2"
  }
```
See all data [here](https://github.com/takumanken/major-studio-1-code/blob/main/quantitave_data/mockup/data/data.json)