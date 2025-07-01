const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const { GOOGLE_API_KEY } = process.env;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function generateContent(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.NUMBER,
          },
        },
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

module.exports = { generateContent };
