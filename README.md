# DocuFlow — AI-Powered Document Workspace

> A full-stack AI document workspace for uploading PDFs and asking questions about their content using Retrieval-Augmented Generation (RAG).

[![Live Demo](https://img.shields.io/badge/Live-Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://docuflow-frontend-orcin.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Surya-Pratap-Singh108/DocuFlow)

## 🌐 Live Demo

**Live Application:**  
https://docuflow-frontend-orcin.vercel.app/

## 📌 Overview

DocuFlow is a MERN-based RAG application that lets users upload PDF documents and ask natural-language questions about them.

### How it works

```text
PDF Upload
   ↓
Text Extraction → Cleaning → Chunking
   ↓
Gemini Embeddings
   ↓
MongoDB + Atlas Vector Search
   ↓
User Query → Query Embedding → Relevant Chunks
   ↓
Gemini + Retrieved Context
   ↓
Grounded Answer + Similarity Score
   ↓
Conversation History
```

The similarity score represents **retrieval relevance**, not Gemini's confidence or a guarantee that the answer is correct.

## ✨ Features

- 🔐 JWT authentication with access + refresh tokens
- 🍪 HTTP-only authentication cookies
- 📄 PDF upload, extraction, cleaning, and chunking
- 🧠 Gemini embeddings and RAG-based answers
- 🔍 MongoDB Atlas Vector Search
- 📊 Retrieval similarity score and source chunks
- 💬 Per-document conversation history
- 🚦 Redis-based AI query rate limiting
- 🧪 Jest tests for important backend logic
- 🐳 Docker and Docker Compose
- ⚙️ GitHub Actions CI/CD
- ☁️ Vercel frontend + Render backend
- 📦 ImageKit PDF storage

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Vector Search | MongoDB Atlas Vector Search |
| AI | Gemini API |
| Auth | JWT, bcrypt, HTTP-only cookies |
| Rate Limiting | Redis |
| Storage | ImageKit |
| Testing | Jest |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Deployment | Vercel, Render |

## 🏗️ Project Structure

```text
DocuFlow/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── ...
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
└── README.md
```

## 🔌 Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/get-accessToken` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/documents/upload` | Upload PDF |
| GET | `/api/documents` | Get user's documents |
| POST | `/api/documents/:id/query` | Ask a document question |
| GET | `/api/documents/:id/conversations` | Get conversation history |
| GET | `/api/health` | Backend health check |

## 🚀 Run Locally

### 1. Clone

```bash
git clone https://github.com/Surya-Pratap-Singh108/DocuFlow.git
cd DocuFlow
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN=your_access_token_secret
REFRESH_TOKEN=your_refresh_token_secret
NODE_ENV=development
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=your_redis_connection_url
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit real `.env` files, API keys, database credentials, or JWT secrets.

## 🐳 Docker

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

## 🧪 Testing

```bash
cd backend
npm test
```

Tests focus on important application logic such as authentication, chunking, retrieval helpers, and rate limiting.

## ⚙️ CI/CD

GitHub Actions performs:

```text
Push / Pull Request
        ↓
Install Dependencies
        ↓
Run Jest Tests
        ↓
Build Frontend
        ↓
Deploy Backend to Render
```

Deployment runs after successful checks for pushes to `main`.

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Vector Search:** MongoDB Atlas Vector Search
- **Redis:** Redis Cloud
- **File Storage:** ImageKit
- **AI:** Gemini API

### Production URLs

**Live Application:**  
https://docuflow-frontend-orcin.vercel.app/

**Backend API:**  
https://docuflow-backend-w2us.onrender.com

## 🔒 Security

- bcrypt password hashing
- JWT authentication
- HTTP-only cookies
- Protected routes
- User/document ownership validation
- CORS configuration
- PDF validation
- Redis AI-query rate limiting
- Environment variables for secrets
- GitHub Secrets for deployment credentials

## 🎯 Project Scope

DocuFlow intentionally avoids unnecessary complexity.

**Included:** authentication, PDF processing, embeddings, vector search, RAG, conversation history, Redis rate limiting, Jest, Docker, CI/CD, and deployment.

**Out of scope:** document sharing, multiple AI agents, LangGraph, multiple AI models, alternative vector databases, microservices, Kubernetes, Kafka, real-time collaboration, admin panels, and excessive UI features.

## 📚 Key Concepts Learned

- MERN architecture and REST APIs
- JWT access/refresh token flow
- HTTP-only cookies
- PDF extraction and text chunking
- Embeddings and vector search
- Retrieval-Augmented Generation
- Gemini API integration
- Redis rate limiting
- Jest testing
- Docker and Docker Compose
- GitHub Actions CI/CD
- Vercel and Render deployment
- Production CORS and cookie configuration

## 👨‍💻 Author

**Surya Pratap Singh**  
Final-year B.Tech Computer Science student

- GitHub: https://github.com/Surya-Pratap-Singh108
- LeetCode: 230+ problems solved

---

> **DocuFlow — built to understand the system, not just make it work.**
