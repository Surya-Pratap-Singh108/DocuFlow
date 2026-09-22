import { Document } from '../models/document.model.js';

export const getDocumentsController = async (req, res) => {
    try {
        const userId = req.userId;
        let documents = await Document.find({
            userId,
        });
        res.status(200).json({ success: true, documents });
    }
    catch (error) {
        console.error("Error in getDocumentController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

