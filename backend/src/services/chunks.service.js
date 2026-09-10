import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


export async function splitDocumentIntoChunks(text) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitText(text);
    return chunks;
}