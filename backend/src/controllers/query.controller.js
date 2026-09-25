import mongoose from "mongoose";
import { Document } from "../models/document.model.js";
import { generateResponse } from "../services/ai.service.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { searchRelevantChunks } from "../services/vectorSearch.service.js";
import  Conversation  from "../models/conversation.model.js";
export const queryController = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }
    const userId =req.userId; 
    const documentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid document ID"
        });
    }

    const document = await Document.findOne({
    _id: documentId,
    userId
});

    if (!document) {
        return res.status(404).json({
            success: false,
            message: "Document not found"
        });
    }
    const queryEmbedding = await generateEmbedding(query);
    const results = await searchRelevantChunks(queryEmbedding, userId, documentId);

    console.log("Similarity scores:", results.map(result => result.score));
    const similarityScore = results.length > 0
    ? results[0].score
    : 0;
    const aiResponse = await generateResponse(query, results);

    let conversation = await Conversation.findOne({
      userId,
      documentId
    });
    if (!conversation) {
      conversation = new Conversation({
        userId,
        documentId,
        messages: []
      });
    }
    conversation.messages.push({
      role: 'user',
      content: query,
    });
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      similarityScore
    });
    await conversation.save();

    const sources = results.map(result => ({
        chunkIndex: result.chunkIndex,
        content: result.content,
        score: result.score
    }));

    res.status(200).json({
        success: true,
        answer: aiResponse,
        similarityScore,
        sources
    });
  } catch (error) {
    console.error("Error in queryController:", error);
    res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
    });
  }
};