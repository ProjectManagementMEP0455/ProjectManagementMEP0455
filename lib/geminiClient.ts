import { GoogleGenAI } from "@google/genai";

// As per the guidelines, the API key must be sourced from environment variables.
// The build system is expected to replace `process.env.API_KEY` with the actual key.
// Do not add any UI to configure this key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "Gemini API key not found in environment variables (process.env.API_KEY). AI features will be disabled."
  );
}

// Initialize the client. If API_KEY is missing, API calls will fail gracefully.
export const ai = new GoogleGenAI({ apiKey: API_KEY! });
