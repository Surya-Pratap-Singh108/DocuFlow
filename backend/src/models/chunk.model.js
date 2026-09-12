import mongoose from "mongoose";


const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    embedding: {
    type: [Number],
    required: false,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Chunk = mongoose.model("Chunk", chunkSchema);
