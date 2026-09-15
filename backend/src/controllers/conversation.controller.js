import Conversation from "../models/conversation.model.js";


export const conversationController = async (req, res) => {
    try {
        const userId = req.userId;
        const documentId = req.params.id;
        let conversation = await Conversation.findOne({
            userId,
            documentId
        });
        res.status(200).json({ success: true, conversation });
    }
    catch (error) {
        console.error("Error in conversationController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}