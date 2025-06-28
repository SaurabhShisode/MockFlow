const DynamicData = require('../models/DynamicData');

class DynamicHandler {
  constructor() {
    this.dataStore = new Map(); // In-memory cache for better performance
  }

  // Get or create dynamic data for a path (shared across all methods)
  async getDynamicData(path) {
    let dynamicData = await DynamicData.findOne({ path });
    
    if (!dynamicData) {
      dynamicData = new DynamicData({
        path,
        data: []
      });
      await dynamicData.save();
    }
    
    return dynamicData;
  }

  // Initialize dynamic data with initial response data
  async initializeData(path, initialData) {
    try {
      let dynamicData = await DynamicData.findOne({ path });
      
      if (!dynamicData) {
        dynamicData = new DynamicData({
          path,
          data: Array.isArray(initialData) ? initialData : []
        });
      } else if (Array.isArray(initialData) && initialData.length > 0) {
        // Add IDs to initial data if they don't have them
        const dataWithIds = initialData.map(item => ({
          ...item,
          id: item.id || this.generateId(),
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date()
        }));
        dynamicData.data = dataWithIds;
      }
      
      await dynamicData.save();
      return dynamicData;
    } catch (error) {
      console.error('Error initializing dynamic data:', error);
      throw error;
    }
  }

  // Handle GET requests - return all data or specific item by ID
  async handleGet(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock.path);
      
      // Check if requesting specific item by ID
      const itemId = req.params.id || req.query.id;
      
      if (itemId) {
        const item = dynamicData.data.find(item => item.id === itemId || item._id === itemId);
        if (item) {
          return res.status(200).json(item);
        } else {
          return res.status(404).json({ error: 'Item not found' });
        }
      }
      
      // Return all data
      return res.status(200).json(dynamicData.data);
    } catch (error) {
      console.error('Error in dynamic GET handler:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle POST requests - create new item
  async handlePost(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock.path);
      
      const newItem = {
        id: this.generateId(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dynamicData.data.push(newItem);
      dynamicData.lastUpdated = new Date();
      await dynamicData.save();
      
      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Error in dynamic POST handler:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle PUT requests - update existing item
  async handlePut(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock.path);
      const itemId = req.params.id || req.query.id;
      
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID required for PUT request' });
      }
      
      const itemIndex = dynamicData.data.findIndex(item => 
        item.id === itemId || item._id === itemId
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const updatedItem = {
        ...dynamicData.data[itemIndex],
        ...req.body,
        updatedAt: new Date()
      };
      
      dynamicData.data[itemIndex] = updatedItem;
      dynamicData.lastUpdated = new Date();
      await dynamicData.save();
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error in dynamic PUT handler:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle DELETE requests - delete item
  async handleDelete(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock.path);
      const itemId = req.params.id || req.query.id;
      
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID required for DELETE request' });
      }
      
      const itemIndex = dynamicData.data.findIndex(item => 
        item.id === itemId || item._id === itemId
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const deletedItem = dynamicData.data[itemIndex];
      dynamicData.data.splice(itemIndex, 1);
      dynamicData.lastUpdated = new Date();
      await dynamicData.save();
      
      return res.status(200).json({ 
        message: 'Item deleted successfully',
        deletedItem 
      });
    } catch (error) {
      console.error('Error in dynamic DELETE handler:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle PATCH requests - partial update
  async handlePatch(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock.path);
      const itemId = req.params.id || req.query.id;
      
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID required for PATCH request' });
      }
      
      const itemIndex = dynamicData.data.findIndex(item => 
        item.id === itemId || item._id === itemId
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const updatedItem = {
        ...dynamicData.data[itemIndex],
        ...req.body,
        updatedAt: new Date()
      };
      
      dynamicData.data[itemIndex] = updatedItem;
      dynamicData.lastUpdated = new Date();
      await dynamicData.save();
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error in dynamic PATCH handler:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate unique ID for items
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear data for a specific path (useful for cleanup)
  async clearData(path) {
    try {
      await DynamicData.deleteMany({ path });
      console.log(`Cleared dynamic data for path ${path}`);
    } catch (error) {
      console.error('Error clearing dynamic data:', error);
    }
  }
}

module.exports = new DynamicHandler(); 
