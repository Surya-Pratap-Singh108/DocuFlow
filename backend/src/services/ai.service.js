import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
})

export const generateResponse = async (query,chunks) => {
    const prompt = `Answer the question using only the context below.
        Context:
        ${chunks.map((chunk, index) => `Chunk ${index + 1}: ${chunk.content}`).join("\n\n")}

        Question: ${query}

        Rules:
        - Use only information from the context.
        - If the context does not contain the answer, say "I don't know based on the provided document."
        - Do not use outside knowledge.
        - Be accurate and concise.
        `;
    const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
    });
    return interaction.output_text;
}