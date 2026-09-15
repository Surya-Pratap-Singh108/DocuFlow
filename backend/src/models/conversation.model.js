import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        similarityScore: {
            type: Number,
            required: false
        },  
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;