import { jest } from "@jest/globals";

jest.unstable_mockModule("@google/genai", () => ({
    GoogleGenAI: jest.fn(() => ({
        interactions: {
            create: jest.fn().mockResolvedValue({
                output_text: "Mock AI answer"
            })
        }
    }))
}));

const { generateResponse } = await import("../services/ai.service.js");
describe("generateResponse", () => {

    test("returns Gemini generated answer", async () => {

        const query = "What is authentication?";

        const chunks = [
            {
                content: "Authentication verifies the identity of a user."
            }
        ];

        const result = await generateResponse(query, chunks);

        expect(result).toBe("Mock AI answer");
    });

});