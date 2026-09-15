import mongoose from "mongoose";


export async function searchRelevantChunks(queryEmbedding,userId,documentId) {
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
                    userId: new mongoose.Types.ObjectId(userId),
                    documentId: new mongoose.Types.ObjectId(documentId)
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