# 🚀 AstroBiomers Deployment Checklist

**Use this checklist to deploy step-by-step**

---

## ✅ Phase 1: Pre-Deployment (COMPLETE FIRST)

### 1.1 Check Files Created
- [ ] `backend/Dockerfile` exists
- [ ] `backend/.dockerignore` exists
- [ ] `backend/render.yaml` exists
- [ ] `frontend/new frontend/.env.production` exists

### 1.2 Update Backend CORS
- [ ] Open `backend/main.py`
- [ ] Check CORS origins includes your frontend domain
- [ ] Add `"*"` temporarily for testing (will update later)

### 1.3 Commit and Push to GitHub
```powershell
cd C:\Users\mi\Downloads\ASTROBIOMERS
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```
- [ ] All files committed
- [ ] Pushed to GitHub
- [ ] Verify on GitHub.com

---

## 🔧 Phase 2: Deploy Backend

### 2.1 Configure Backend on Render
On the Render dashboard you have open:

- [ ] **Name**: `astrobiomers-backend`
- [ ] **Language**: Docker
- [ ] **Branch**: main
- [ ] **Region**: Singapore (Southeast Asia)
- [ ] **Root Directory**: `backend`
- [ ] **Dockerfile Path**: `/backend/Dockerfile`

### 2.2 Set Instance Type
- [ ] Select: **Free** (512 MB RAM, 0.1 CPU) for testing
- [ ] Or: **Starter** ($7/month) for production with better performance

### 2.3 Add Environment Variables
Click "Advanced" → "Add Environment Variable":

```
NEO4J_URI = neo4j+s://d3ff59a7.databases.neo4j.io
NEO4J_USER = neo4j
NEO4J_PASSWORD = your-neo4j-password
NEO4J_DATABASE = neo4j
CORS_ORIGINS = *
```

- [ ] All environment variables added
- [ ] Double-check Neo4j credentials

### 2.4 Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for errors
- [ ] Note your backend URL: `https://astrobiomers-backend.onrender.com`

### 2.5 Test Backend
- [ ] Open: `https://astrobiomers-backend.onrender.com/health`
- [ ] Should return: `{"status": "healthy"}`
- [ ] Test API: `https://astrobiomers-backend.onrender.com/docs`
- [ ] Swagger UI should load

---

## 🌐 Phase 3: Deploy Frontend

### 3.1 Update Frontend Environment
- [ ] Edit `frontend/new frontend/.env.production`
- [ ] Update `VITE_API_URL` with your backend URL
- [ ] Example: `VITE_API_URL=https://astrobiomers-backend.onrender.com/api`
- [ ] Commit and push changes

### 3.2 Create Static Site on Render
Go to Render Dashboard → "New" → "Static Site":

- [ ] **Name**: `astrobiomers-frontend`
- [ ] **Repository**: NimaFathima/astrobiomers
- [ ] **Branch**: main
- [ ] **Root Directory**: `frontend/new frontend`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`

### 3.3 Add Frontend Environment Variable
- [ ] Key: `VITE_API_URL`
- [ ] Value: `https://astrobiomers-backend.onrender.com/api`

### 3.4 Deploy Frontend
- [ ] Click "Create Static Site"
- [ ] Wait for build (3-5 minutes)
- [ ] Note your frontend URL: `https://astrobiomers.onrender.com`

---

## 🔄 Phase 4: Connect Services

### 4.1 Update Backend CORS
- [ ] Go to backend service on Render
- [ ] Environment → Edit `CORS_ORIGINS`
- [ ] Change from `*` to: `https://astrobiomers.onrender.com`
- [ ] Click "Save Changes"
- [ ] Backend will auto-redeploy

### 4.2 Test Full Application
- [ ] Open frontend: `https://astrobiomers.onrender.com`
- [ ] Navigate to Knowledge Graph
- [ ] Search for "stem cells"
- [ ] Verify graph loads
- [ ] Click on papers
- [ ] Test all pages

---

## ✨ Phase 5: Final Verification

### 5.1 Functionality Tests
- [ ] Home page loads
- [ ] Knowledge Graph works
- [ ] Search returns results
- [ ] Papers are clickable
- [ ] External links work
- [ ] No console errors (F12)

### 5.2 Performance Tests
- [ ] Page load < 5 seconds
- [ ] API responses < 3 seconds
- [ ] Graph renders smoothly
- [ ] No timeouts

### 5.3 Mobile Test
- [ ] Open on mobile browser
- [ ] Check responsive design
- [ ] Test touch interactions
- [ ] Verify all features work

---

## 🐛 Troubleshooting

### Backend Won't Start
- [ ] Check Render logs for errors
- [ ] Verify all environment variables set
- [ ] Check Neo4j connection
- [ ] Verify Dockerfile syntax

### Frontend Build Fails
- [ ] Check build logs
- [ ] Verify package.json scripts
- [ ] Check Node version compatibility
- [ ] Try local build first: `npm run build`

### CORS Errors
- [ ] Check backend CORS_ORIGINS includes frontend URL
- [ ] Verify frontend is using correct API URL
- [ ] Check browser console for exact error
- [ ] Make sure URLs have https:// (not http://)

### Database Connection Fails
- [ ] Verify Neo4j Aura is running
- [ ] Check credentials in environment variables
- [ ] Test connection from local machine
- [ ] Check Neo4j Aura firewall settings (should allow all IPs)

---

## 📝 URLs to Save

After deployment, save these URLs:

```
Frontend: https://astrobiomers.onrender.com
Backend API: https://astrobiomers-backend.onrender.com
API Docs: https://astrobiomers-backend.onrender.com/docs
Health Check: https://astrobiomers-backend.onrender.com/health
Neo4j Console: https://console.neo4j.io
```

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Backend health check returns 200 OK
- ✅ Frontend loads without errors
- ✅ Knowledge Graph displays data
- ✅ Search functionality works
- ✅ Papers are clickable and open correctly
- ✅ All pages accessible
- ✅ No CORS errors in console

---

## 📊 Post-Deployment

### Monitoring
- [ ] Set up Render health checks
- [ ] Monitor error logs daily
- [ ] Check uptime status
- [ ] Review performance metrics

### Optimization
- [ ] Enable CDN if available
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Add caching headers

### Documentation
- [ ] Update README with live URLs
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Create user guide

---

## 🆘 Need Help?

**Render Issues:**
- Check Render docs: https://render.com/docs
- View logs in Render dashboard
- Contact Render support

**Application Issues:**
- Check browser console (F12)
- Review backend logs
- Test API endpoints directly
- Verify environment variables

---

**Last Updated:** October 5, 2025
**Status:** Ready for deployment
**Next Action:** Commit files and push to GitHub
