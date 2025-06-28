const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mockflow';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const migrateDynamicData = async () => {
  try {
    console.log('Starting DynamicData migration...');
    
    // Get the DynamicData collection
    const DynamicData = mongoose.connection.collection('dynamicdatas');
    
    // Find all documents with the old schema (with mockId field)
    const oldDocuments = await DynamicData.find({ mockId: { $exists: true } }).toArray();
    console.log(`Found ${oldDocuments.length} documents with old schema`);
    
    if (oldDocuments.length === 0) {
      console.log('No old documents found. Migration complete.');
      return;
    }
    
    // Group documents by path
    const pathGroups = {};
    oldDocuments.forEach(doc => {
      if (!pathGroups[doc.path]) {
        pathGroups[doc.path] = [];
      }
      pathGroups[doc.path].push(doc);
    });
    
    console.log('Path groups:', Object.keys(pathGroups));
    
    // For each path, merge all data and create a single new document
    for (const [path, documents] of Object.entries(pathGroups)) {
      console.log(`Processing path: ${path}`);
      
      // Merge all data from documents for this path
      const mergedData = [];
      let latestUpdate = new Date(0);
      
      documents.forEach(doc => {
        if (doc.data && Array.isArray(doc.data)) {
          mergedData.push(...doc.data);
        }
        if (doc.lastUpdated && new Date(doc.lastUpdated) > latestUpdate) {
          latestUpdate = new Date(doc.lastUpdated);
        }
      });
      
      console.log(`Merged ${mergedData.length} items for path ${path}`);
      
      // Create new document with path-based schema
      const newDocument = {
        path: path,
        data: mergedData,
        lastUpdated: latestUpdate
      };
      
      // Remove old documents for this path
      await DynamicData.deleteMany({ path: path });
      console.log(`Deleted old documents for path ${path}`);
      
      // Insert new document
      await DynamicData.insertOne(newDocument);
      console.log(`Created new document for path ${path}`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

const runMigration = async () => {
  await connectDB();
  await migrateDynamicData();
  await mongoose.connection.close();
  console.log('Migration script finished.');
};

runMigration(); 