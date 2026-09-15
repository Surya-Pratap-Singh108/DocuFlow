import {uploadFile} from '../config/imageKit.js';
import { Chunk } from '../models/chunk.model.js';
import { Document } from '../models/document.model.js';
import { splitDocumentIntoChunks } from '../services/createChunks.service.js';
import { generateEmbedding } from '../services/embedding.service.js';
import { extractText } from '../services/pdfParser.service.js';
import { cleanText } from '../services/cleanText.service.js';

export const uploadController = async (req, res) => {
    let document;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const isPdfExtension = req.file.originalname.endsWith('.pdf');
        if (!isPdfExtension) {
            return res.status(400).json({ message: 'Only PDF files are allowed' });
        }
        // Upload the file to ImageKit
        const uploadResult = await uploadFile({
            buffer: req.file.buffer,
            fileName: req.file.originalname,
            folder: 'DocuFlow'
        });
        //parsing the pdf file to extract text tjen cleaning the text 
        const pdfBuffer = req.file.buffer;
        const extractedText = await extractText(pdfBuffer); 
        const cleanedText = cleanText(extractedText);
        
        
        // Process the uploaded file
        document = new Document({
            userId: req.userId,
            title: req.body.title || req.file.originalname,
            fileName: req.file.originalname,
            fileUrl: uploadResult.url,
            extractedText: cleanedText,
        });
        await document.save();
        const chunks = await splitDocumentIntoChunks(cleanedText);

        const chunkDocuments = await Promise.all(
            chunks.map(async (chunk, index) => ({
                documentId: document._id,
                userId: req.userId,
                content: chunk,
                chunkIndex: index,
                embedding: await generateEmbedding(chunk)
            }))
        );

        await Chunk.insertMany(chunkDocuments);
        document.status = "ready";
        await document.save();

        return res.status(201).json({
            message: 'File uploaded successfully', 
            document,            
            });        
    } catch (error) {
        if (document) {
            document.status = "failed";
            await document.save();
        }
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error processing document' });
    }
};