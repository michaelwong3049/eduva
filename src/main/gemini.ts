import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export async function getGeminiMessage() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
    config: {
      toolConfig: {

      },
      tools: [{

      }]
    }
  });
  return response;
}

