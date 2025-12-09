const DynamicData = {};
const Mock = require('../models/Mock');
const RequestLog = require('../models/RequestLog');

function initializeData(path, initialData) {
  if (!DynamicData[path]) {
    if (Array.isArray(initialData)) {
      DynamicData[path] = initialData.map((item, index) => {
        if (typeof item.id === 'undefined') {
          return { id: index + 1, ...item };
        }
        return item;
      });
    } else {
      DynamicData[path] = [];
    }
  }
}

function getData(path) {
  return DynamicData[path] || [];
}

function saveData(path, data) {
  DynamicData[path] = data;
}

async function track(mock, req, res, body, status, start) {
  const time = Date.now() - start;
  await Mock.findByIdAndUpdate(mock._id, {
    $inc: { accessCount: 1 },
    lastAccessed: new Date()
  });

  const log = new RequestLog({
    mockId: mock._id,
    userId: mock.userId,
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    queryParams: req.query,
    requestBody: req.body,
    responseBody: body,
    statusCode: status,
    clientIP: req.ip,
    responseTime: time
  });

  await log.save();
}

async function handleGet(mock, req, res) {
  const start = Date.now();
  const id = req.params.id;
  const data = getData(mock.path);

  if (id) {
    const item = data.find(x => String(x.id) === String(id));
    if (!item) {
      await track(mock, req, res, { error: 'Not found' }, 404, start);
      return res.status(404).json({ error: 'Not found' });
    }
    await track(mock, req, res, item, 200, start);
    return res.json(item);
  }

  await track(mock, req, res, data, 200, start);
  return res.json(data);
}

async function handlePost(mock, req, res) {
  const start = Date.now();
  const data = getData(mock.path);
  const newItem = { id: Date.now(), ...req.body };
  data.push(newItem);
  saveData(mock.path, data);
  await track(mock, req, res, newItem, 201, start);
  return res.status(201).json(newItem);
}

async function handlePut(mock, req, res) {
  const start = Date.now();
  const id = req.params.id;
  const data = getData(mock.path);
  const idx = data.findIndex(x => String(x.id) === String(id));

  if (idx === -1) {
    await track(mock, req, res, { error: 'Not found' }, 404, start);
    return res.status(404).json({ error: 'Not found' });
  }

  data[idx] = { ...data[idx], ...req.body };
  saveData(mock.path, data);
  await track(mock, req, res, data[idx], 200, start);
  return res.json(data[idx]);
}

async function handlePatch(mock, req, res) {
  return handlePut(mock, req, res);
}

async function handleDelete(mock, req, res) {
  const start = Date.now();
  const id = req.params.id;
  const data = getData(mock.path);
  const idx = data.findIndex(x => String(x.id) === String(id));

  if (idx === -1) {
    await track(mock, req, res, { error: 'Not found' }, 404, start);
    return res.status(404).json({ error: 'Not found' });
  }

  const deleted = data.splice(idx, 1)[0];
  saveData(mock.path, data);
  await track(mock, req, res, deleted, 200, start);
  return res.json(deleted);
}

module.exports = {
  initializeData,
  handleGet,
  handlePost,
  handlePut,
  handlePatch,
  handleDelete
};
