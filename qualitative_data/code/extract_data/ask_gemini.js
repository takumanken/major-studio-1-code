import { GEMINI_API_KEY } from "../../../secrets.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from 'fs';
import util from 'util';
import process from 'process';

// Read in the JSON data
let wikiData, transformedData;
try {
  wikiData = JSON.parse(fs.readFileSync('../../data/wiki_contents.json', 'utf-8'));
  transformedData = JSON.parse(fs.readFileSync('../../data/transformed_data.json', 'utf-8'));
} catch (error) {
  console.error('Error reading input files:', error);
  process.exit(1);
}

// Get start and end arguments from command line
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Please provide start and end indices as arguments.");
  process.exit(1);
}

const start = parseInt(args[0], 10);
const end = parseInt(args[1], 10);

if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
  console.error("Invalid start or end indices provided. Make sure they are valid numbers and end is greater than start.");
  process.exit(1);
}

// Get the target IDs from wikiData
const targetIds = wikiData.slice(start, end).map(data => data.id);

// Initialize Google Generative AI instance
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configure the AI model to use
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      description: "Object which describes the person",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            nullable: false,
          },
          description: {
            type: SchemaType.STRING,
            nullable: false,
          },
          mainEvents: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                year: {
                  type: SchemaType.INTEGER,
                  nullable: false,
                },
                description: {
                  type: SchemaType.STRING,
                  nullable: false,
                },
              },
            },
          },
          portraitMoment: {
            type: SchemaType.STRING,
            nullable: false,
          },
        },
        required: ["id", "description", "mainEvents", "portraitMoment"],
      },
    },
  },
});

let responses = [];

// Iterate through the IDs and generate content for each
(async () => {
  let processedCount = 0;
  const sleep = util.promisify(setTimeout);

  for (let targetId of targetIds) {
    // Pause to respect API rate limits
    await sleep(4000);

    try {
      // Find the painting in wiki_contents or transformed_data
      const wikiInfo = wikiData.find(data => data.id === targetId);
      const basicInfo = transformedData.find(data => data.id === targetId);

      if (!wikiInfo || !basicInfo) {
        console.error(`Data for ID ${targetId} not found in wikiData or transformedData.`);
        continue;
      }

      const { id, name, portraiteYear } = basicInfo;
      const { wikiURL, content } = wikiInfo;

      // Create the prompt for Gemini
      const prompt = `
      You are a historian researching the lives of various historical figures.
      Your task is to provide information about the life of ${name} that will be used as a reference for the portrait of ${name}.

      I will provide the following information about ${name}.
      You need to follow the following data structure.

      - id: just returns '${id}'.
      - wikiurl: just returns '${wikiURL}'.
      - Description: A description of ${name} from the information provided, in about 30 words. This should reflect the person's historical significance, accomplishments, and fan facts about the person. You should start with "${name} is a...".
      - mainEvents: List up to five major events in ${name}'s life, including birth, death, and up to three major historical events. Year must be "YYYY" format integer, not ranges or decades. Description should be no more than 10 words.
      - portraitMoment: A brief description of what time ${portraiteYear} was in ${name}'s life. Consider the person's age, accomplishments, and events before and after. This field should begin with "This portrait drawn in ${portraiteYear} seems to capture the moment when...". You can be poetic, but you must be historically accurate.

      Information - HTML from Wikipedia, ignore unrelated information:
      ${content}
      `;

      // Request Gemini to generate content based on the prompt
      const result = await model.generateContent([prompt]);

      // Parse the JSON response
      const responseObject = JSON.parse(result.response.text());
      responses.push(...responseObject);
      processedCount++;
      if (processedCount % 5 === 0) {
        console.log(`Processed ${processedCount} records so far.`);
      }

    } catch (error) {
      console.error(`An error occurred while processing ID ${targetId}:`, error);
      if (error.response) {
        // Log additional information from the API error response
        console.error("Status Code:", error.response.status);
        console.error("Response Data:", error.response.data);
      } else {
        console.error("Unexpected error:", error.message);
      }
    }
  }

  // Write the output to the specified JSON file
  fs.writeFileSync(`../../data/gemini_responses_${start}-${end}.json`, JSON.stringify(responses, null, 2), 'utf-8');
})();