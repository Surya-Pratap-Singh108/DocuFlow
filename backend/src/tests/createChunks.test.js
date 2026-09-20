import {splitDocumentIntoChunks} from '../services/createChunks.service.js' 

describe("splitDocumentIntoChunks", () => {

    test("splits text into chunks", async () => {

        const text = "A long text that needs to be split into chunks. ".repeat(100); // Repeat to ensure it's long enough
        const result = await splitDocumentIntoChunks(text);
    // Assert
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(1);
});

});