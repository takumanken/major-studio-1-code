# Uncover the Moment
## Overview
This visualization aims to enrich portraits with narratives and stories through generative AI.


## Mockup
### Start Page
![Default State](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/mockup/image/start_page.png)

### Search Interface
![Zoom-In](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/mockup/image/search_interface.png)

### Portrait Interface
![Zoom-In](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/mockup/image/portrait_page.png)

## Data
### Data Source
- [National Portrait Gallery](https://www.si.edu/museums/portrait-gallery)

### # of Data Point
512 (After cleansing data)
```javascript
unit_code:"NPG" AND "portrait" AND "painting" AND online_media_type:"Images"
```
### JSON Structure
```JSON
  {
    "id": "ld1-1643399756728-1643399760027-0",
    "title": "John George Brown",
    "objectType": "Painting",
    "portraiteYear": "1907",
    "name": "John George Brown",
    "period": "11 Nov 1831 - 8 Feb 1913",
    "sex": "Male",
    "categories": [
      "Arts & Culture"
    ],
    "artistName": "Gilbert Gaul",
    "isSelfPortrait": false,
    "imageLink": "https://ids.si.edu/ids/deliveryService?id=NPG-NPG_70_39",
    "thumbnailLink": "https://ids.si.edu/ids/deliveryService?id=NPG-NPG_70_39&max=200",
    "thumbnailPath": "./data/thumbnails/ld1-1643399756728-1643399760027-0.jpg",
    "detailLink": "https://npg.si.edu/object/npg_NPG.70.39"
  },
```
See all data [here](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/code/extract_data/data/transformed_data.json)