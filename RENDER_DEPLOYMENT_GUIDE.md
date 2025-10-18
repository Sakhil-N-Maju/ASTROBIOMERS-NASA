# 🚀 AstroBiomers - Render Deployment Guide

**Complete Step-by-Step Guide for Deploying to Render**

---

## 📋 Prerequisites Checklist

Before deploying, ensure you have:
- ✅ GitHub repository: `NimaFathima/astrobiomers`
- ✅ Neo4j Aura database (already set up)
- ✅ Render account (you're already logged in)
- ✅ All code pushed to GitHub

---

## 🎯 Deployment Strategy

We'll deploy **TWO services** on Render:

1. **Backend API** (FastAPI/Python) - Web Service
2. **Frontend** (React/Vite) - Static Site

---

## 🔧 STEP 1: Deploy Backend API

### Configuration Settings:

Based on your screenshot, fill in:

| Field | Value |
|-------|-------|
| **Name** | `astrobiomers-backend` |
| **Language** | `Docker` |
| **Branch** | `main` |
| **Region** | `Singapore (Southeast Asia)` |
| **Root Directory** | `backend` |
| **Dockerfile Path** | `/backend/Dockerfile` |

### Instance Type:
- For testing: **Free** (512 MB RAM, 0.1 CPU)
- For production: **Starter** ($7/month, 512 MB RAM, 0.5 CPU)

### Environment Variables:
Click "Add Environment Variable" and add these:

```env
NEO4J_URI=neo4j+s://d3ff59a7.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j
OPENAI_API_KEY=your-openai-key-if-needed
CORS_ORIGINS=https://astrobiomers.onrender.com
```

⚠️ **IMPORTANT:** Update `CORS_ORIGINS` after you know your frontend URL!

---

## 📁 STEP 2: Create Backend Dockerfile

You need a Dockerfile in the `backend` folder. I'll create it for you.

---

## 🌐 STEP 3: Deploy Frontend

After backend is deployed, create a **new Static Site** for frontend:

### Configuration:

| Field | Value |
|-------|-------|
| **Name** | `astrobiomers-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend/new frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables for Frontend:

```env
VITE_API_URL=https://astrobiomers-backend.onrender.com/api
```

⚠️ **Replace with your actual backend URL** after backend is deployed!

---

## 🔄 Deployment Order

**IMPORTANT:** Deploy in this order:

1. ✅ Backend first (get the URL)
2. ✅ Update frontend env with backend URL
3. ✅ Deploy frontend
4. ✅ Update backend CORS with frontend URL
5. ✅ Redeploy backend

---

## 📝 What's Next Right Now

Based on your screenshot, you're at **Step 2: Configure**. Here's what to do:

### Immediately:
1. Change **Root Directory** to: `backend`
2. Change **Dockerfile Path** to: `/backend/Dockerfile`
3. Select **Instance Type**: Free (for now)
4. Click **"Advanced"** to add environment variables

### Then:
1. I'll create the necessary Docker files
2. Commit and push to GitHub
3. Continue with Render deployment
4. Deploy frontend next

---

## ⏭️ Next Steps

Let me create all the necessary deployment files for you:
1. Backend Dockerfile
2. Docker-compose for local testing
3. Frontend build configuration
4. Deployment scripts

Ready to proceed?

---

**Status:** Ready to create deployment files
**Action Required:** Confirm to proceed with file creation
