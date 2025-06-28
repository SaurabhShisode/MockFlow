require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Mock = require('./models/Mock');
const RequestLog = require('./models/RequestLog');
const dynamicHandler = require('./utils/dynamicHandler');

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

let activeRoutes = new Map();

async function loadExistingMocks() {
  try {
    const mocks = await Mock.find({});
    mocks.forEach(mock => {
      const routeKey = `${mock.method}:${mock.path}`;
      activeRoutes.set(routeKey, mock);
      registerMockRoute(mock);
    });
    console.log(`Loaded ${mocks.length} existing mocks from database`);
    
    // Initialize dynamic data for existing dynamic mocks
    const dynamicMocks = mocks.filter(mock => mock.isDynamic);
    for (const mock of dynamicMocks) {
      try {
        await dynamicHandler.initializeData(mock.path, mock.response);
        console.log(`Initialized dynamic data for existing path ${mock.path}`);
      } catch (error) {
        console.error(`Error initializing dynamic data for path ${mock.path}:`, error);
      }
    }
  } catch (error) {
    console.error('Error loading existing mocks:', error);
  }
}

async function logRequest(mock, req, res, responseBody, statusCode, responseTime) {
  try {
    console.log(`Logging request for mock ${mock._id}:`, {
      method: req.method,
      path: req.path,
      statusCode,
      responseTime
    });

    const requestLog = new RequestLog({
      mockId: mock._id,
      method: req.method,
      path: req.path,
      headers: req.headers,
      queryParams: req.query,
      requestBody: req.body,
      responseBody: responseBody,
      statusCode: statusCode,
      clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
      responseTime: responseTime
    });

    await requestLog.save();
    console.log(`Request logged successfully with ID: ${requestLog._id}`);

    const logCount = await RequestLog.countDocuments({ mockId: mock._id });
    console.log(`Total logs for mock ${mock._id}: ${logCount}`);
    
    if (logCount > 50) {
      const oldestLogs = await RequestLog.find({ mockId: mock._id })
        .sort({ timestamp: 1 })
        .limit(logCount - 50);
      
      if (oldestLogs.length > 0) {
        await RequestLog.deleteMany({ _id: { $in: oldestLogs.map(log => log._id) } });
        console.log(`Cleaned up ${oldestLogs.length} old logs for mock ${mock._id}`);
      }
    }
  } catch (error) {
    console.error('Error logging request:', error);
  }
}

function registerMockRoute(mock) {
  const routeKey = `${mock.method}:${mock.path}`;
  
  app[mock.method.toLowerCase()](mock.path, async (req, res) => {
    const startTime = Date.now();
    let responseBody;
    let statusCode;
    
    try {
      await Mock.findByIdAndUpdate(mock._id, {
        $inc: { accessCount: 1 },
        lastAccessed: new Date()
      });

      if (mock.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, mock.delay));
      }

      // Check if this is a dynamic endpoint
      if (mock.isDynamic) {
        // Handle dynamic CRUD operations
        switch (mock.method) {
          case 'GET':
            await dynamicHandler.handleGet(mock, req, res);
            return;
          case 'POST':
            await dynamicHandler.handlePost(mock, req, res);
            return;
          case 'PUT':
            await dynamicHandler.handlePut(mock, req, res);
            return;
          case 'DELETE':
            await dynamicHandler.handleDelete(mock, req, res);
            return;
          case 'PATCH':
            await dynamicHandler.handlePatch(mock, req, res);
            return;
          default:
            responseBody = { error: 'Unsupported method for dynamic endpoint' };
            statusCode = 405;
            res.status(statusCode).json(responseBody);
            return;
        }
      } else {
        // Handle static response (original behavior)
        responseBody = mock.response;
        statusCode = mock.status;
        res.status(statusCode).json(responseBody);
      }
    } catch (error) {
      console.error('Error serving mock:', error);
      responseBody = { error: 'Internal server error' };
      statusCode = 500;
      res.status(statusCode).json(responseBody);
    } finally {
      const responseTime = Date.now() - startTime;
      logRequest(mock, req, res, responseBody, statusCode, responseTime);
    }
  });
}

app.post('/start-mock', async (req, res) => {
  try {
    const { path, method, status, response, delay, isDynamic } = req.body;

    if (!path || !method || !status || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const routeKey = `${method}:${path}`;
    
    const existingMock = await Mock.findOne({ path, method });
    if (existingMock) {
      return res.status(409).json({ 
        error: 'Mock already exists for this route and method',
        mockId: existingMock._id 
      });
    }

    const newMock = new Mock({
      path,
      method: method.toUpperCase(),
      status: Number(status),
      response: typeof response === 'string' ? JSON.parse(response) : response,
      delay: Number(delay) || 0,
      isDynamic: Boolean(isDynamic)
    });

    await newMock.save();

    // Initialize dynamic data if this is a dynamic endpoint
    if (newMock.isDynamic) {
      try {
        await dynamicHandler.initializeData(newMock.path, newMock.response);
        console.log(`Initialized dynamic data for path ${newMock.path}`);
      } catch (error) {
        console.error('Error initializing dynamic data:', error);
        // Don't fail the mock creation if dynamic data initialization fails
      }
    }

    activeRoutes.set(routeKey, newMock);
    registerMockRoute(newMock);

    res.status(200).json({ 
      message: `Mock created: ${method.toUpperCase()} ${path}`,
      mockId: newMock._id,
      isDynamic: newMock.isDynamic
    });

  } catch (error) {
    console.error('Error creating mock:', error);
    res.status(500).json({ error: 'Failed to create mock endpoint' });
  }
});

app.get('/mocks', async (req, res) => {
  try {
    const mocks = await Mock.find({}).sort({ createdAt: -1 });
    res.json(mocks);
  } catch (error) {
    console.error('Error fetching mocks:', error);
    res.status(500).json({ error: 'Failed to fetch mocks' });
  }
});

app.get('/mocks/:id/requests', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    
    console.log(`Fetching requests for mock ${id} with limit ${limit}`);
    
    const requests = await RequestLog.find({ mockId: id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    console.log(`Found ${requests.length} requests for mock ${id}`);
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching request logs:', error);
    res.status(500).json({ error: 'Failed to fetch request logs' });
  }
});

app.delete('/mocks/:id', async (req, res) => {
  try {
    const mock = await Mock.findByIdAndDelete(req.params.id);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }

    // Clean up request logs
    await RequestLog.deleteMany({ mockId: req.params.id });
    
    // Clean up dynamic data if it was a dynamic endpoint
    if (mock.isDynamic) {
      await dynamicHandler.clearData(mock.path);
    }

    const routeKey = `${mock.method}:${mock.path}`;
    activeRoutes.delete(routeKey);

    res.json({ message: 'Mock deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock:', error);
    res.status(500).json({ error: 'Failed to delete mock' });
  }
});

app.get('/mocks/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mock = await Mock.findById(id);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }
    
    if (!mock.isDynamic) {
      return res.status(400).json({ error: 'This mock is not dynamic' });
    }
    
    const dynamicData = await dynamicHandler.getDynamicData(mock.path);
    res.json({
      mockId: mock._id,
      path: mock.path,
      method: mock.method,
      data: dynamicData.data,
      count: dynamicData.data.length,
      lastUpdated: dynamicData.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching dynamic data:', error);
    res.status(500).json({ error: 'Failed to fetch dynamic data' });
  }
});

app.delete('/mocks/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mock = await Mock.findById(id);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }
    
    if (!mock.isDynamic) {
      return res.status(400).json({ error: 'This mock is not dynamic' });
    }
    
    await dynamicHandler.clearData(mock.path);
    res.json({ message: 'Dynamic data cleared successfully' });
  } catch (error) {
    console.error('Error clearing dynamic data:', error);
    res.status(500).json({ error: 'Failed to clear dynamic data' });
  }
});

app.get('/test-logging/:mockId', async (req, res) => {
  try {
    const { mockId } = req.params;
    
    console.log(`Testing logging for mock ${mockId}`);
    
    const mock = await Mock.findById(mockId);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }
    
    const logCount = await RequestLog.countDocuments({ mockId });
    const recentLogs = await RequestLog.find({ mockId })
      .sort({ timestamp: -1 })
      .limit(5);
    
    res.json({
      mockId,
      mockPath: mock.path,
      mockMethod: mock.method,
      totalLogs: logCount,
      recentLogs: recentLogs.map(log => ({
        id: log._id,
        timestamp: log.timestamp,
        method: log.method,
        path: log.path,
        statusCode: log.statusCode
      }))
    });
  } catch (error) {
    console.error('Error testing logging:', error);
    res.status(500).json({ error: 'Failed to test logging' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MockFlow Backend is running!',
    activeMocks: activeRoutes.size,
    endpoints: {
      'POST /start-mock': 'Create a new mock endpoint',
      'GET /mocks': 'Get all mocks',
      'GET /mocks/:id/requests': 'Get request history for a mock',
      'GET /test-logging/:mockId': 'Test request logging for a mock',
      'DELETE /mocks/:id': 'Delete a mock endpoint'
    }
  });
});

app.listen(port, async () => {
  console.log(`Mock server listening at http://localhost:${port}`);
  await loadExistingMocks();
});
