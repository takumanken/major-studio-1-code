import { GEMINI_API_KEY } from "../../../secrets.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs'; 

// Read in the JSON data
let portraits_paintings = JSON.parse(fs.readFileSync('data/transformed_data.json', 'utf-8'));

// Check if an ID was provided as an argument
const args = process.argv.slice(2);
let selectedPainting;

if (args.length > 0) {
  const providedId = args[0];
  selectedPainting = portraits_paintings.find(painting => painting.id === providedId);
  if (!selectedPainting) {
    console.error(`Error: No painting found with id '${providedId}'`);
    process.exit(1);
  }
} else {
  // Get a random index from portraits_paintings array if no ID is provided
  const randomIndex = Math.floor(Math.random() * portraits_paintings.length);
  selectedPainting = portraits_paintings[randomIndex];
}

// Destructure the selected painting's properties
const { id, name, period, keywords, portraiteYear, isSelfPortrait } = selectedPainting;

const prompt = `
Create a factual and concise dictionary entry for ${name} (${period}) to be used as descriptive text for his/her portrait.

Consider the following keywords to help identify him/her in the portrait:
${keywords.join("\n")}

Self-portrait: ${isSelfPortrait ? "Yes" : "No"}

Please follow this format and ensure accuracy:

- description: A factual description of ${name} in no more than 20 words, avoiding subjective or speculative language.
- mainEvents: Four key events from ${name}'s life, including birth, two major historical events, and death, formatted as 'YYYY: Brief description.' Each event must use a single year (no date ranges or decades), and each description should be within 20 words.
- portraitMoment: A sentence describing the context of the provided portrait, based on historical facts and considering ${name}'s timeline (e.g., early, peak, or later in life). This must be within 30 words and begin with: 'This portrait, drawn in (the year), seems to capture the moment...'. If it's a self-portrait, you must mention that in the beginning.
- Before submitting your response, please verify that all information is accurate and verifiable.`;

const schema = {
    description: "Object which describes the person",
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        description: {
            type: SchemaType.STRING,
            nullable: false,
        },
        mainEvents: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING,
            },
            nullable: false,
        },
        portraitMoment: {
            type: SchemaType.STRING,
            nullable: false,
        },
        funFact: {
            type: SchemaType.STRING,
            nullable: false,
        },
      },
      required: ["description", "mainEvents", "portraitMoment", "funFact"],
    },
  };

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

const uploadResult = await fileManager.uploadFile(
  `./data/thumbnails/${id}.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: `${name}'s portrait`,
  },
);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    // model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

try {
  const result = await model.generateContent([
    prompt,
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);
  
  // Parse the JSON response text and then pretty-print it
  const responseObject = JSON.parse(result.response.text());

  console.log("Name: ", name);
  console.log("id: ", id);
  console.log("Self-portrait: ", isSelfPortrait);
  console.log(JSON.stringify(responseObject, null, 2));
} catch (error) {
  console.error("An error occurred while calling the Gemini API:", error);
  if (error.response) {
    // The error response from the API may contain additional information
    console.error("Status Code:", error.response.status);
    console.error("Response Data:", error.response.data);
  } else {
    console.error("Unexpected error:", error.message);
  }
}