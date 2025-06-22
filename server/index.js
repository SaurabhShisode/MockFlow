const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let mocks = [];

function applyMockRoutes() {
  mocks.forEach(({ path, method, status, response, delay }) => {
    app[method.toLowerCase()](path, (req, res) => {
      setTimeout(() => {
        res.status(status).json(response);
      }, delay || 0);
    });
  });
}


app.post('/start-mock', (req, res) => {
  const { path, method, status, response, delay } = req.body;

  if (!path || !method || !status || !response) {
    return res.status(400).send('Missing required fields');
  }


  const existing = mocks.find(m => m.path === path && m.method === method);
  if (existing) {
    return res.status(409).send('Mock already exists for this route and method');
  }

  const newMock = { path, method, status, response, delay };
  mocks.push(newMock);

  app[method.toLowerCase()](path, (req, res) => {
    setTimeout(() => {
      res.status(status).json(response);
    }, delay || 0);
  });

  res.status(200).send(`✅ Mock created: ${method.toUpperCase()} ${path}`);
});


app.get('/', (req, res) => {
  res.send('Mockflow Backend is running! Use POST /start-mock to create mocks.');
});

app.listen(port, () => {
  console.log(`🚀 Mock server listening at http://localhost:${port}`);
});
