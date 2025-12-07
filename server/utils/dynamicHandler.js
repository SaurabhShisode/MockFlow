const DynamicData = {};

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

function handleGet(mock, req, res) {
  const id = req.params.id;
  const data = getData(mock.path);

  if (id) {
    const item = data.find(x => String(x.id) === String(id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.json(item);
  }

  return res.json(data);
}

function handlePost(mock, req, res) {
  const data = getData(mock.path);
  const newId = Date.now();
  const newItem = { id: newId, ...req.body };
  data.push(newItem);
  saveData(mock.path, data);
  return res.status(201).json(newItem);
}

function handlePut(mock, req, res) {
  const id = req.params.id;
  const data = getData(mock.path);

  const idx = data.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  data[idx] = { ...data[idx], ...req.body };
  saveData(mock.path, data);

  return res.json(data[idx]);
}

function handlePatch(mock, req, res) {
  return handlePut(mock, req, res);
}

function handleDelete(mock, req, res) {
  const id = req.params.id;
  const data = getData(mock.path);

  const idx = data.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const deleted = data.splice(idx, 1);
  saveData(mock.path, data);

  return res.json(deleted[0]);
}

module.exports = {
  initializeData,
  handleGet,
  handlePost,
  handlePut,
  handlePatch,
  handleDelete
};
