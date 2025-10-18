# Knowledge Graph Feature - Installation Checklist

## ✅ Pre-Installation (Already Done)
- [x] D3.js installed (`npm install d3 @types/d3`)
- [x] Navigation updated with "Knowledge Graph" link
- [x] Route added to App.tsx
- [x] KnowledgeGraph.tsx component created
- [x] Python backend created in `/backend/` folder
- [x] Documentation created
- [x] Startup scripts created

## 📋 Next Steps (You Need to Do)

### 1. Install Python Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed Flask-3.0.0 flask-cors-4.0.0 ...
```

### 2. Start the Backend Server
```powershell
python app.py
```

**Expected output:**
```
============================================================
🚀 Space Biology Knowledge Graph Backend
============================================================
Backend is running on: http://localhost:5000
...
```

**✓ Keep this terminal window open!**

### 3. Test the Backend (Optional)
Open a new PowerShell window:
```powershell
curl http://localhost:5000/api/health
```

**Expected output:**
```json
{"status":"ok","message":"Backend is running"}
```

### 4. Access Knowledge Graph in Your App

1. Your Vite dev server should still be running
2. Open your browser (e.g., http://localhost:8080)
3. Click "Knowledge Graph" in navigation
4. You should see the Knowledge Graph page

### 5. Test with a Search

Try searching for:
- `stem cells`
- `microgravity`  
- `bone loss`

**Expected result:**
- Graph appears with colored nodes
- Blue node in center (your search term)
- Green nodes around it (research papers)
- Lines connecting them

### 6. Verify Interactions

- [ ] Can drag nodes around
- [ ] Can zoom with mouse wheel
- [ ] Can click green paper nodes
- [ ] Details appear in right panel
- [ ] "Open Full Article" button works

## 🐛 Troubleshooting

### Issue: "Failed to fetch" error in browser

**Checklist:**
- [ ] Backend is running (check terminal)
- [ ] Backend shows "http://localhost:5000"
- [ ] No error messages in backend terminal
- [ ] Try restarting backend: Ctrl+C, then `python app.py`

### Issue: Python not found

**Solution:**
- Install Python from https://www.python.org/
- Make sure to check "Add Python to PATH" during installation
- Restart PowerShell after installation

### Issue: pip not found

**Solution:**
```powershell
python -m ensurepip --upgrade
```

### Issue: Module not found (Flask or flask-cors)

**Solution:**
```powershell
cd backend
pip install --upgrade -r requirements.txt
```

### Issue: Port 5000 already in use

**Solution:**
1. Find what's using port 5000:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Kill the process or change port in `backend/app.py`:
   ```python
   # Change last line from:
   app.run(debug=True, port=5000)
   # To:
   app.run(debug=True, port=5001)
   ```
3. Also update `src/pages/KnowledgeGraph.tsx`:
   ```typescript
   const API_BASE_URL = 'http://localhost:5001/api';
   ```

### Issue: Graph appears but no nodes

**Solution:**
- Check browser console (F12) for errors
- Verify search term returned results
- Try a broader term like "microgravity"

## 🎉 Success Criteria

You know everything is working when:
- ✓ Backend terminal shows "Backend is running"
- ✓ Knowledge Graph page loads without errors
- ✓ Searching displays a force-directed graph
- ✓ Nodes are draggable
- ✓ Clicking papers shows details
- ✓ "Open Full Article" opens NCBI page

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Backend: Look at terminal where `python app.py` is running
   - Frontend: Open browser DevTools (F12) → Console tab

2. **Read the docs:**
   - Setup: `KNOWLEDGE_GRAPH_SETUP.md`
   - User Guide: `KNOWLEDGE_GRAPH_USER_GUIDE.md`
   - Backend API: `backend/README.md`

3. **Common fixes:**
   - Restart backend server
   - Clear browser cache
   - Check all required files exist
   - Verify Python and pip are installed

## 🔄 When Everything Works

Once confirmed working, you can use these convenience scripts:

**Start both frontend and backend:**
```powershell
.\start-app.ps1
```

**Start only backend:**
```powershell
.\start-backend.ps1
```

## 📝 Notes

- Backend must be running for Knowledge Graph to work
- Other features (Hero, Research, etc.) work without backend
- Backend is temporary and can be easily removed later
- All your existing files are unchanged

---

**Ready to start?** 
1. Open PowerShell
2. Navigate to your project: `cd C:\Users\sakhi\Documents\bio-star-insight`
3. Run: `cd backend; pip install -r requirements.txt; python app.py`
4. Open another terminal and access your app
5. Click "Knowledge Graph" and start exploring! 🚀
