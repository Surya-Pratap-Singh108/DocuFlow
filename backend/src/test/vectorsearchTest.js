import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const runTest = async () => {
    try {
        const { default: connectDB } = await import("../config/db.js");
        const { generateEmbedding } = await import("../services/embedding.service.js");
        const { searchRelevantChunks } = await import("../services/vectorSearch.service.js");

        await connectDB();

        const question =
            "What are the technical skills mentioned in this resume?";

        const queryEmbedding = await generateEmbedding(question);

        const results = await searchRelevantChunks(queryEmbedding,"000000000000000000000001");

        console.log("\nRetrieved chunks with scores:\n");

        results.forEach((chunk, index) => {
            console.log(`--- Result ${index + 1} ---`);
            console.log("Chunk Index:", chunk.chunkIndex);
            console.log("Score:", chunk.score);
            console.log("Content:", chunk.content);
            console.log();
        });

    } catch (error) {
        console.error("Vector search test failed:", error);
    } finally {
        await mongoose.connection.close();
    }
};

runTest();