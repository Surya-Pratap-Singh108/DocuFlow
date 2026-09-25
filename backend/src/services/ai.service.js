import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        retryOptions: {
            attempts: 2,
            initialDelay: 1000,
            maxDelay: 10000,
            httpStatusCodes: [408, 500, 502, 503, 504],
        },
    },
});

export const generateResponse = async (query, chunks) => {
    const prompt = `Answer the question using only the context below.
        Context:
        ${chunks
            .map((chunk, index) => `Chunk ${index + 1}: ${chunk.content}`)
            .join("\n\n")}

        Question: ${query}

        Rules:
        - Use only information from the context.
        - If the context does not contain the answer, say "I don't know based on the provided document."
        - Do not use outside knowledge.
        - Be accurate and concise.
    `;

    try {
        console.log("FLASH/GEMINI GENERATION CALLED");

        const interaction = await ai.interactions.create({
            model: "gemini-2.5-flash",
            input: prompt,
        });

        return interaction.output_text;

    } catch (error) {
        console.error("Gemini generation error:", error);

        if (error.status === 429) {
            const retryAfter = error.headers?.get?.("retry-after");

            const rateLimitError = new Error(
                `AI service is temporarily rate-limited.${
                    retryAfter
                        ? ` Please try again in ${retryAfter} seconds.`
                        : ""
                }`
            );

            rateLimitError.status = 429;
            throw rateLimitError;
        }

        throw new Error("Failed to generate AI response.");
    }
};