import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Tone, GenerationResponse, GeneratedPostContent } from "../types";
import { MODEL_TEXT, MODEL_IMAGE } from "../constants";

// Initialize GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    linkedin: {
      type: Type.OBJECT,
      properties: {
        postText: { type: Type.STRING, description: "The actual post content for LinkedIn." },
        imagePrompt: { type: Type.STRING, description: "A highly specific image generation prompt based directly on the content of postText. If postText mentions specific objects (e.g., coffee, laptop, sneakers), include them. If abstract, use a matching visual metaphor. Professional style." }
      },
      required: ["postText", "imagePrompt"]
    },
    twitter: {
      type: Type.OBJECT,
      properties: {
        postText: { type: Type.STRING, description: "The tweet content. Short, punchy, with hashtags." },
        imagePrompt: { type: Type.STRING, description: "A specific image generation prompt that visually depicts the subject matter of the tweet. Bold, high-contrast style." }
      },
      required: ["postText", "imagePrompt"]
    },
    instagram: {
      type: Type.OBJECT,
      properties: {
        postText: { type: Type.STRING, description: "The Instagram caption with a block of relevant hashtags." },
        imagePrompt: { type: Type.STRING, description: "A specific image generation prompt that visually depicts the subject matter of the caption. Aesthetic, photography-style." }
      },
      required: ["postText", "imagePrompt"]
    }
  },
  required: ["linkedin", "twitter", "instagram"]
};

export const generatePostContent = async (idea: string, tone: Tone): Promise<GenerationResponse> => {
  const prompt = `
    Act as an expert social media manager.
    I have an idea: "${idea}".
    Please generate 3 distinct social media posts for this idea using a "${tone}" tone.
    
    1. LinkedIn: Professional, insightful, structure with paragraphs.
    2. Twitter/X: Short, punchy, under 280 chars, 1-2 hashtags max.
    3. Instagram: Visual-first, engaging caption, include 10-15 relevant hashtags.
    
    For EACH platform, write a specific, high-quality image generation prompt that is STRICTLY related to the content of the post you just wrote.
    - CRITICAL: The image MUST visually represent the specific nouns, verbs, or core metaphors used in your generated post text.
    - Do NOT generate generic "social media" images.
    - If the post is about "coffee", the image MUST show coffee.
    - If the post is about "coding", the image MUST show code or a computer.
    - The LinkedIn image prompt should be professional (e.g. modern office, specific industry equipment).
    - The Twitter image prompt should be bold and high-contrast.
    - The Instagram image prompt should be aesthetic and photography-style.
    
    Ensure the image prompts are descriptive, visual, and optimized for a text-to-image model.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a world-class social media strategist and content creator. Your goal is to create cohesive content where the text and visuals are perfectly aligned."
      }
    });

    if (!response.text) {
      throw new Error("No content generated");
    }

    return JSON.parse(response.text) as GenerationResponse;
  } catch (error) {
    console.error("Text generation error:", error);
    throw error;
  }
};

export const generateImageForPlatform = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: MODEL_IMAGE,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg'
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error(`Image generation error for ratio ${aspectRatio}:`, error);
    throw error;
  }
};