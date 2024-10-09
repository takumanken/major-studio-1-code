import { GEMINI_API_KEY } from "../../../secrets.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from 'fs';

let portraits_paintings = JSON.parse(fs.readFileSync('data/transformed_data.json', 'utf-8'));

// Get a random index from portraits_paintings array
const randomIndex = Math.floor(Math.random() * portraits_paintings.length);
const name = portraits_paintings[randomIndex].name;
const period = portraits_paintings[randomIndex].period;
const keywords = portraits_paintings[randomIndex].keywords;

const prompt = `
Create a factual and concise dictionary entry for ${name} (${period}). Use the following format and be as accurate as possible:

Known Keywords:
${keywords.join("\n")}

The response should strictly include:
1. A brief description of ${name} in up to 30 words. Avoid subjective or speculative statements.
2. Up to Four significant events from ${name}'s life, including birth and death, formatted as "YYYY: EventDescription". If unsure about the facts, you don't need to include them.
3. A verifiable fun fact about ${name}, in up to 30 words.

The accuracy is the priority over creativity. Please ensure that the information is correct and verifiable.
`;

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
        fun_fact: {
            type: SchemaType.STRING,
            nullable: false,
        },
      },
      required: ["description", "mainEvents", "fun_fact"],
    },
  };

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

const result = await model.generateContent(prompt);

// Parse the JSON response text and then pretty-print it
const responseObject = JSON.parse(result.response.text());

console.log("Name: ", name);
console.log(JSON.stringify(responseObject, null, 2));