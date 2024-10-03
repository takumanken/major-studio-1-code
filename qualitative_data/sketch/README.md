# 1. Worth It?

### Overview
The Smithsonian's National Numismatic Collection houses a vast and diverse collection of coins and bills. However, when looking at these items, some may wonder, "How valuable were they?" This data visualization illustrates the purchasing power of these coins and bills during the time they were in circulation, using a pictorial chart to show what they could buy.

### Sketches
Default
![default](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/sketch/image/worth_it_1.jpg)

After clicking coin/bill
![after_click](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/sketch/image/worth_it_2.jpg)

### Approaches
1. Extract coin and bill data about collected year, description, its value from the Smithsonian API.
2. List the years the coins and bills were in use.
3. Research the cost of living during those years.
4. Calculate what the coins and bills could buy at that time.
5. Build the visualization.

### Considerations
- The historical cost of living is critical data for this visualization, but there is a risk that the estimates may be subjective or inaccurate. It's important to show the method used for these estimates to users to avoid confusion.


# 2. Portrait TimeLens

### Overview
The Smithsonian Portrait Collection contains a vast and diverse archive of portraits, including influential historical figures, but sometimes lacks descriptions of the context and background of the person in the portraits. This visualization enhances the context of the portraits through the power of generative AI, adding context about what the person was like and when the moment of the portrait occurred in their life.

### Sketches
Default
![default](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/sketch/image/timelens_1.jpg)

After clicking coin/bill
![after_click](https://github.com/takumanken/major-studio-1-code/blob/main/qualitative_data/sketch/image/timelens_2.jpg)

### Approach
1. Extract portrait data from the Smithsonian API.
2. Filter out unnamed portraits.
3. Use the Gemini API to generate a summary and timeline for each prominent figure in a specified JSON format.
4. Filter out data that is obviously incorrect or inefficient.
5. Build the visualization.

### Considerations
- AI hallucinations: There is a risk of AI hallucinations, especially when dealing with lesser-known people. It's important not only to declare this risk on the page, but also to carefully design prompts to minimize hallucinations.
- Gemini Token: Consider the practical use of the Gemini API given the tokens available. There is a possibility that interaction with the Gemini API could be real-time if batch processing is unrealistic.

# 3. Art Wheel

### Overview
This visualization classifies paintings from the Smithsonian American Art Museum by the main colors used and allows users to explore the collections using a color wheel. When viewers select a color, the tool additionally displays paintings that also uses that color as main, with options to apply additional filters for sub-colors and accent colors. Color classification is performed by AI (Gemini).

### Sketches

### How to build it
1. Extract painting data from the Smithsonian American Art Museum using the Smithsonian API.
2. Use the Gemini API to identify the main, sub, and accent colors.
3. Build the visualization.

### Considerations
- AI hallucinations: Based on my brief testing, the risk of hallucination in this context is considered relatively low.
- Gemini tokens: Batch processing is required because realtime interaction with Gemini is unrealistic from the perspective of performance. Plan a realistic token usage strategy to implement this application considering the number of data points.