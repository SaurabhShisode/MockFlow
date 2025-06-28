const DynamicData = require('../models/DynamicData');

class DynamicHandler {
  constructor() {
    this.dataStore = new Map(); // In-memory cache for better performance
  }

  // Get or create dynamic data for a mock
  async getDynamicData(mockId, path) {
    let dynamicData = await DynamicData.findOne({ mockId, path });
    
    if (!dynamicData) {
      dynamicData = new DynamicData({
        mockId,
        path,
        data: []
      });
      await dynamicData.save();
    }
    
    return dynamicData;
  }

  // Handle GET requests - return all data or specific item by ID
  async handleGet(mock, req, res) {
    try {
      const dynamicData = await this.getDynamicData(mock._id, mock.path);
      
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
      const dynamicData = await this.getDynamicData(mock._id, mock.path);
      
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
      const dynamicData = await this.getDynamicData(mock._id, mock.path);
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
      const dynamicData = await this.getDynamicData(mock._id, mock.path);
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
      const dynamicData = await this.getDynamicData(mock._id, mock.path);
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

  // Clear data for a specific mock (useful for cleanup)
  async clearData(mockId) {
    try {
      await DynamicData.deleteMany({ mockId });
      console.log(`Cleared dynamic data for mock ${mockId}`);
    } catch (error) {
      console.error('Error clearing dynamic data:', error);
    }
  }
}

module.exports = new DynamicHandler(); 