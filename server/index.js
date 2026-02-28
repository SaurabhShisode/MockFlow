require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Mock = require('./models/Mock');
const Collection = require('./models/Collection');
const RequestLog = require('./models/RequestLog');
const dynamicHandler = require('./utils/dynamicHandler');
const authMiddleware = require('./middleware/auth');


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
      userId: mock.userId,
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
  const method = mock.method.toLowerCase();

  if (mock.isDynamic) {
    const base = mock.path;

    app.get(base, (req, res) => dynamicHandler.handleGet(mock, req, res));
    app.post(base, (req, res) => dynamicHandler.handlePost(mock, req, res));

    app.get(base + '/:id', (req, res) => dynamicHandler.handleGet(mock, req, res));
    app.put(base + '/:id', (req, res) => dynamicHandler.handlePut(mock, req, res));
    app.patch(base + '/:id', (req, res) => dynamicHandler.handlePatch(mock, req, res));
    app.delete(base + '/:id', (req, res) => dynamicHandler.handleDelete(mock, req, res));

    return;
  }

  app[method](mock.path, async (req, res) => {
    const start = Date.now();
    let responseBody;
    let statusCode;

    try {
      await Mock.findByIdAndUpdate(mock._id, {
        $inc: { accessCount: 1 },
        lastAccessed: new Date()
      });

      if (mock.delay > 0) {
        await new Promise(r => setTimeout(r, mock.delay));
      }

      responseBody = mock.response;
      statusCode = mock.status;
      res.status(statusCode).json(responseBody);
    } catch (err) {
      responseBody = { error: 'Internal server error' };
      statusCode = 500;
      res.status(statusCode).json(responseBody);
    } finally {
      const time = Date.now() - start;
      logRequest(mock, req, res, responseBody, statusCode, time);
    }
  });
}


app.post('/start-mock', authMiddleware, async (req, res) => {
  try {
    const { path, method, status, response, delay, isDynamic } = req.body;

    if (!path || !method || !status || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = req.user.uid;
    const routeKey = `${method}:${path}:${userId}`;

    const existingMock = await Mock.findOne({ path, method, userId });
    if (existingMock) {
      return res.status(409).json({
        error: 'Mock already exists for this route and method for this user',
        mockId: existingMock._id
      });
    }

    const newMock = new Mock({
      path,
      method: method.toUpperCase(),
      status: Number(status),
      response: typeof response === 'string' ? JSON.parse(response) : response,
      delay: Number(delay) || 0,
      isDynamic: !!isDynamic,
      userId
    });

    await newMock.save();

    if (newMock.isDynamic) {
      try {
        await dynamicHandler.initializeData(newMock.path, newMock.response);
      } catch (error) {
      }
    }

    activeRoutes.set(routeKey, newMock);
    registerMockRoute(newMock);

    res.status(200).json({
      message: `Mock created: ${method.toUpperCase()} ${path}`,
      mockId: newMock._id
    });
  } catch (error) {
    console.error('Error creating mock:', error);
    res.status(500).json({ error: 'Failed to create mock endpoint' });
  }
});


app.get('/mocks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const mocks = await Mock.find({ userId }).sort({ createdAt: -1 });
    res.json(mocks);
  } catch (error) {
    console.error('Error fetching mocks:', error);
    res.status(500).json({ error: 'Failed to fetch mocks' });
  }
});



app.get('/mocks/:id/requests', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user.uid;

    const mock = await Mock.findOne({ _id: id, userId });
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found for this user' });
    }

    const requests = await RequestLog.find({ mockId: id, userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(requests);
  } catch (error) {
    console.error('Error fetching request logs:', error);
    res.status(500).json({ error: 'Failed to fetch request logs' });
  }
});


app.delete('/mocks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    const mock = await Mock.findOneAndDelete({ _id: req.params.id, userId });
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found for this user' });
    }

    await RequestLog.deleteMany({ mockId: req.params.id, userId });

    const routeKey = `${mock.method}:${mock.path}:${userId}`;
    activeRoutes.delete(routeKey);

    res.json({ message: 'Mock deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock:', error);
    res.status(500).json({ error: 'Failed to delete mock' });
  }
});


app.put('/mocks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { path, method, status, response, delay, isDynamic, collectionId } = req.body;

    const mock = await Mock.findOne({ _id: req.params.id, userId });
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found for this user' });
    }

    const oldRouteKey = `${mock.method}:${mock.path}:${userId}`;
    activeRoutes.delete(oldRouteKey);

    mock.path = path || mock.path;
    mock.method = method ? method.toUpperCase() : mock.method;
    mock.status = status ? Number(status) : mock.status;
    mock.response = response !== undefined ? (typeof response === 'string' ? JSON.parse(response) : response) : mock.response;
    mock.delay = delay !== undefined ? Number(delay) : mock.delay;
    mock.isDynamic = isDynamic !== undefined ? !!isDynamic : mock.isDynamic;
    if (collectionId !== undefined) mock.collectionId = collectionId || null;

    await mock.save();

    const newRouteKey = `${mock.method}:${mock.path}:${userId}`;
    activeRoutes.set(newRouteKey, mock);
    registerMockRoute(mock);

    if (mock.isDynamic) {
      try {
        await dynamicHandler.initializeData(mock.path, mock.response);
      } catch (error) {
        console.error('Error re-initializing dynamic data:', error);
      }
    }

    res.json({ message: `Mock updated: ${mock.method} ${mock.path}`, mockId: mock._id });
  } catch (error) {
    console.error('Error updating mock:', error);
    res.status(500).json({ error: 'Failed to update mock' });
  }
});


app.post('/collections', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Collection name is required' });

    const collection = new Collection({ name: name.trim(), description: description || '', color: color || '#6366f1', userId });
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Collection with this name already exists' });
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

app.get('/collections', authMiddleware, async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.put('/collections/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description;
    if (color) collection.color = color;
    await collection.save();
    res.json(collection);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Collection with this name already exists' });
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

app.delete('/collections/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, userId });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    await Mock.updateMany({ collectionId: req.params.id, userId }, { $set: { collectionId: null } });
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});




app.get("/logs/paginated", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user.uid;

    const logs = await RequestLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalLogs = await RequestLog.countDocuments({ userId });

    res.json({
      logs: logs.map(log => ({
        _id: log._id,
        timestamp: log.timestamp,
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        clientIP: log.clientIP,
        requestBody: log.requestBody,
        responseBody: log.responseBody,
        headers: log.headers
      })),
      totalPages: Math.ceil(totalLogs / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

app.delete("/user/delete", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;


    await Mock.deleteMany({ userId: uid });


    await RequestLog.deleteMany({ userId: uid });


    if (global.dynamicStores && global.dynamicStores[uid]) {
      delete global.dynamicStores[uid];
    }


    res.json({ success: true, message: "Account and all data deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user account" });
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
