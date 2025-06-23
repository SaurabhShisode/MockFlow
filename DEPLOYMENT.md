# Deployment Guide - Solving Render Persistence Issue

## The Problem
Render's free tier shuts down services after 15 minutes of inactivity, causing all mock endpoints to be lost when the server restarts.

## The Solution
We've implemented MongoDB persistence to solve this issue. Here's how to deploy it:

## Step 1: Set Up MongoDB Atlas (Free)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create a Cluster**
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render deployment)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## Step 2: Deploy Backend to Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `mockflow-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` (if your backend is in a server folder)

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     - **Key**: `MONGO_URI`
     - **Value**: Your MongoDB connection string from Step 1
   - **Key**: `PORT`
     - **Value**: `5000` (or leave empty for Render to set)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://your-app.onrender.com`)

## Step 3: Update Frontend API URLs

Update these files to use your new backend URL:

### `client/src/components/MockForm.tsx`
```typescript
// Change this line:
const res = await fetch('https://mockflow-backend.onrender.com/start-mock', {
// To:
const res = await fetch('https://your-app.onrender.com/start-mock', {
```

### `client/src/components/MockList.tsx`
```typescript
// Change this line:
const response = await fetch('https://mockflow-backend.onrender.com/mocks');
// To:
const response = await fetch('https://your-app.onrender.com/mocks');

// And this line:
const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${id}`, {
// To:
const response = await fetch(`https://your-app.onrender.com/mocks/${id}`, {
```

## Step 4: Deploy Frontend

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Site**
   - **Name**: `mockflow-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `client` (if your frontend is in a client folder)

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete

## Step 5: Test Persistence

1. **Create a Mock**
   - Go to your deployed frontend
   - Create a new mock endpoint
   - Note the URL

2. **Test the Endpoint**
   - Use the provided URL or CURL command
   - Verify it returns your mock response

3. **Simulate Server Restart**
   - Wait 15+ minutes for Render to shut down your service
   - Or manually restart the service in Render dashboard
   - Try accessing your mock endpoint again
   - It should still work! 🎉

## Troubleshooting

### Database Connection Issues
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user has correct permissions

### Environment Variables
- Make sure `MONGO_URI` is set correctly in Render
- Check for typos in the connection string
- Ensure the password is URL-encoded if it contains special characters

### CORS Issues
- The backend already has CORS configured
- If you get CORS errors, check that your frontend URL is correct

## Benefits of This Solution

✅ **Persistent Storage** - Mocks survive server restarts
✅ **Usage Tracking** - See how many times each mock is accessed
✅ **Mock Management** - View, delete, and manage all mocks
✅ **Free Tier Compatible** - Works with Render's free tier limitations
✅ **Scalable** - Can handle many mocks without performance issues

## Cost Considerations

- **MongoDB Atlas**: Free tier includes 512MB storage (plenty for mocks)
- **Render**: Free tier for both frontend and backend
- **Total Cost**: $0/month for small to medium usage

---

Your mocks will now persist even when Render shuts down your service! 🚀 