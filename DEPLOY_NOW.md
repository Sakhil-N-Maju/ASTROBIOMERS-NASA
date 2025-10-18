# 🚀 DEPLOY TO RENDER - DO THIS NOW!

**Quick Action Guide - Follow These Steps Exactly**

---

## ⚡ IMMEDIATE STEPS (Do Right Now!)

### Step 1: Push to GitHub (2 minutes)

Run this in PowerShell:

```powershell
cd C:\Users\mi\Downloads\ASTROBIOMERS
.\deploy_to_render.ps1
```

Or manually:
```powershell
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

✅ **Done?** Check GitHub.com - files should appear there.

---

### Step 2: Configure Render Backend (5 minutes)

**On the Render page you have open**, fill in exactly:

#### Basic Settings:
```
Name:            astrobiomers-backend
Language:        Docker
Branch:          main
Region:          Singapore (Southeast Asia)
Root Directory:  backend
Dockerfile Path: /Dockerfile
```

#### Instance Type:
- Select: **Free** (for testing)
- Or: **Starter** ($7/month for production)

---

### Step 3: Add Environment Variables

Click **"Advanced"** button, then add these one by one:

```
Key: NEO4J_URI
Value: neo4j+s://d3ff59a7.databases.neo4j.io

Key: NEO4J_USER
Value: neo4j

Key: NEO4J_PASSWORD
Value: your-neo4j-password

Key: NEO4J_DATABASE
Value: neo4j

Key: CORS_ORIGINS
Value: *
```

⚠️ **IMPORTANT**: Copy-paste these exactly! No extra spaces.

---

### Step 4: Deploy Backend

1. Click **"Create Web Service"** button (bottom of page)
2. Wait 5-10 minutes for build
3. Watch the logs - should see:
   ```
   Building Docker image...
   Successfully built...
   Starting service...
   Uvicorn running on...
   ```

4. When done, you'll get a URL like:
   ```
   https://astrobiomers-backend.onrender.com
   ```

---

### Step 5: Test Backend

Once deployed, test it:

1. Open: `https://astrobiomers-backend.onrender.com/health`
   - Should show: `{"status":"healthy"}`

2. Open: `https://astrobiomers-backend.onrender.com/docs`
   - Should show Swagger API documentation

✅ **If both work** → Backend deployed successfully!

---

## 🌐 NEXT: Deploy Frontend (After Backend Works)

### Step 1: Update Frontend Config

1. Open: `frontend/new frontend/.env.production`
2. Replace with YOUR backend URL:
   ```
   VITE_API_URL=https://astrobiomers-backend.onrender.com/api
   ```

3. Commit and push:
   ```powershell
   git add .
   git commit -m "Update frontend API URL"
   git push origin main
   ```

---

### Step 2: Create Frontend Static Site

Go to Render Dashboard → **"New +"** → **"Static Site"**

#### Settings:
```
Name:                astrobiomers-frontend
Repository:          NimaFathima/astrobiomers
Branch:              main
Root Directory:      frontend/new frontend
Build Command:       npm install && npm run build
Publish Directory:   dist
```

#### Environment Variable:
```
Key: VITE_API_URL
Value: https://astrobiomers-backend.onrender.com/api
```
(Use YOUR actual backend URL!)

#### Click "Create Static Site"

---

### Step 3: Wait for Frontend Build

- Takes 3-5 minutes
- Watch build logs
- Should see: `Build successful`
- You'll get URL: `https://astrobiomers.onrender.com`

---

## ✅ Final Steps

### Update Backend CORS

1. Go to backend service in Render
2. Environment tab
3. Edit `CORS_ORIGINS`
4. Change from `*` to your frontend URL:
   ```
   https://astrobiomers.onrender.com
   ```
5. Click "Save Changes" (backend will auto-redeploy)

---

## 🎉 TEST YOUR DEPLOYED APP!

Open: `https://astrobiomers.onrender.com`

Test:
- ✅ Home page loads
- ✅ Navigate to Knowledge Graph
- ✅ Search "stem cells"
- ✅ Graph displays
- ✅ Click papers - details show
- ✅ No CORS errors (check console with F12)

---

## 🐛 Troubleshooting

### Backend Build Fails:
- Check logs in Render dashboard
- Verify Dockerfile syntax
- Make sure requirements.txt is in backend folder

### Frontend Build Fails:
- Check Node version (should be 18+)
- Verify package.json exists
- Try local build first: `npm run build`

### "CORS Error" in Browser:
- Check backend CORS_ORIGINS includes frontend URL
- Make sure both URLs use https:// (not http://)
- Check browser console for exact error

### Database Connection Fails:
- Verify Neo4j Aura is running
- Check environment variables spelling
- Test connection from backend logs

---

## 📱 Quick Reference

**Your URLs** (save these):
```
Backend:    https://astrobiomers-backend.onrender.com
Frontend:   https://astrobiomers.onrender.com
API Docs:   https://astrobiomers-backend.onrender.com/docs
Health:     https://astrobiomers-backend.onrender.com/health
```

---

## 🆘 Need Help?

**If stuck:**
1. Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
2. Review Render logs for errors
3. Check browser console (F12)
4. Verify all environment variables are set

---

**Ready? Let's deploy! 🚀**

Start with Step 1 above ⬆️
