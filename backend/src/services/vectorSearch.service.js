import mongoose from "mongoose";


export async function searchRelevantChunks(queryEmbedding,userId) {
    const collection = mongoose.connection.db.collection("chunks");

    const results = await collection.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 20,
                limit: 3,
                filter: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
        },
        {
            $set: {
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }
    ]).toArray();

    return results;
}