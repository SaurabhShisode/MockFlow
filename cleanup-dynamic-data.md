# Dynamic Data Cleanup Guide

## Issue
The database has multiple `DynamicData` documents for the same path `/mock/crop` with different `mockId` values, which means the old logic is still being used.

## Solution

### Option 1: Manual Database Cleanup (Recommended)

1. **Connect to your MongoDB database** (via MongoDB Compass, Atlas, or command line)

2. **Find all DynamicData documents:**
   ```javascript
   db.dynamicdatas.find({})
   ```

3. **Delete all existing DynamicData documents:**
   ```javascript
   db.dynamicdatas.deleteMany({})
   ```

4. **Restart your server** to ensure it uses the new path-based logic

### Option 2: Use MongoDB Atlas (if using Atlas)

1. Go to your MongoDB Atlas dashboard
2. Navigate to Collections
3. Find the `dynamicdatas` collection
4. Delete all documents manually

### Option 3: Programmatic Cleanup

If you have access to run Node.js scripts on your server:

```javascript
// Run this in your server environment
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  const DynamicData = mongoose.connection.collection('dynamicdatas');
  await DynamicData.deleteMany({});
  console.log('All DynamicData documents deleted');
  await mongoose.connection.close();
}

cleanup();
```

## After Cleanup

1. **Restart your server**
2. **Recreate your dynamic mock endpoints**
3. **Test the functionality**

The new logic will create only one `DynamicData` document per path, and all HTTP methods for that path will share the same data.

## Verification

After cleanup, when you check the database, you should see:
- Only ONE `DynamicData` document per path
- No `mockId` field in the documents
- Only `path`, `data`, `lastUpdated` fields 