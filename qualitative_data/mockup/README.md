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

## How to use of AI
### Platform
- [Google AI Studio](https://ai.google.dev/aistudio) (within [the free tier](https://ai.google.dev/pricing))

### Model
Gemini-1.5 Flash

### Strategy to avoid hallucination
- To avoid hallucinations, content generation takes the form of summarizing information gathered from a variety of trusted sources, rather than asking Gemini to generate content from scratch.

## Data
### Data Source
- [National Portrait Gallery](https://www.si.edu/museums/portrait-gallery)

### Search Query
```javascript
unit_code:"NPG" AND "portrait" AND "painting" AND online_media_type:"Images"
```

### # of Data Point
512 (After cleansing data)

### JSON Structure

Smithsonian Data
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
Gemini Reponse
```JSON
  {
    "id": "ld1-1643399756728-1643399810255-0",
    "description": "John Winthrop was an English Puritan leader and the first governor of the Massachusetts Bay Colony.",
    "funFact": "Winthrop is considered one of the most influential figures in early American history.",
    "mainEvents": [
      "1587: Born in Groton, Suffolk, England",
      "1629: Led the first major wave of Puritan migration to Massachusetts",
      "1630: Established the Massachusetts Bay Colony in Boston",
      "1649: Died in Boston, Massachusetts"
    ],
    "portraitMoment": "This portrait, drawn in the early 1600s, seems to capture the moment of Winthrop's early years as governor, a time of significant development and growth for the colony."
  }
```
See all data [here](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/code/extract_data/data/transformed_data.json)