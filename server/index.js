require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Mock = require('./models/Mock');

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
  } catch (error) {
    console.error('Error loading existing mocks:', error);
  }
}

function registerMockRoute(mock) {
  const routeKey = `${mock.method}:${mock.path}`;
  
  app[mock.method.toLowerCase()](mock.path, async (req, res) => {
    try {

      await Mock.findByIdAndUpdate(mock._id, {
        $inc: { accessCount: 1 },
        lastAccessed: new Date()
      });

      if (mock.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, mock.delay));
      }

      res.status(mock.status).json(mock.response);
    } catch (error) {
      console.error('Error serving mock:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}


app.post('/start-mock', async (req, res) => {
  try {
    const { path, method, status, response, delay } = req.body;

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
      delay: Number(delay) || 0
    });

    await newMock.save();

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

app.get('/mocks', async (req, res) => {
  try {
    const mocks = await Mock.find({}).sort({ createdAt: -1 });
    res.json(mocks);
  } catch (error) {
    console.error('Error fetching mocks:', error);
    res.status(500).json({ error: 'Failed to fetch mocks' });
  }
});


app.delete('/mocks/:id', async (req, res) => {
  try {
    const mock = await Mock.findByIdAndDelete(req.params.id);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }


    const routeKey = `${mock.method}:${mock.path}`;
    activeRoutes.delete(routeKey);

    res.json({ message: 'Mock deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock:', error);
    res.status(500).json({ error: 'Failed to delete mock' });
  }
});


app.get('/', (req, res) => {
  res.json({ 
    message: 'MockFlow Backend is running!',
    activeMocks: activeRoutes.size,
    endpoints: {
      'POST /start-mock': 'Create a new mock endpoint',
      'GET /mocks': 'Get all mocks',
      'DELETE /mocks/:id': 'Delete a mock endpoint'
    }
  });
});


app.listen(port, async () => {
  console.log(`Mock server listening at http://localhost:${port}`);
  await loadExistingMocks();
});
