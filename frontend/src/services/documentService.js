import { axiosInstance } from "./api";

export const getDocuments = async () => {
  const response = await axiosInstance.get("/documents");
  return response.data;
};


export const getConversation = async (documentId) => {
  const response = await axiosInstance.get(`/documents/${documentId}/conversations`);
  return response.data;
};

export const queryDocument = async (documentId, query) => {
  const response = await axiosInstance.post(`/documents/${documentId}/query`, { query });
  return response.data;
};

export const uploadDocument = async (file, title) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", title);

  const response = await axiosInstance.post(
    "/documents/upload",
    formData
  );

  return response.data;
};