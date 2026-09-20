import { cleanText } from "../services/cleanText.service.js";

describe("cleanText", () => {

    test("removes PDF page number artifacts", () => {

        // Arrange
        const input = "Hello world -- 1 of 1 --";

        // Act
        const result = cleanText(input);

        // Assert
        expect(result).toBe("Hello world");

    });
    test("cleans extra whitespace", () => {
    // Arrange
    const input = "     Hello      world    " ;

    // Act
    const result = cleanText(input);

    // Assert
    expect(result).toBe("Hello world");
});

});