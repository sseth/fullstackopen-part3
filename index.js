const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
morgan.token('request-data', (req, res) => JSON.stringify(req.body));
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens['request-data'](req, res),
    ].join(' ');
  })
);

let data = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api', (req, res) => {
  res.send('Hello');
});

app.get('/api/info', (req, res) => {
  const info = `Phonebook has info for ${data.length} ${
    data.length === 1 ? 'person' : 'people'
  }`;
  res.send(
    `<p>${info}</p>
      <p>${Date()}</p>`
  );
});

app.get('/api/persons', (req, res) => {
  res.json(data);
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  if (!name || !number)
    return res.status(400).json({
      error: 'name and number required',
    });

  if (data.find((p) => p.name.toLowerCase() === name.toLowerCase()))
    return res.status(400).json({
      error: `'${name}' already exists`,
    });

  const id = Math.ceil(Math.random() * 10000);
  const newEntry = { id, name, number };
  data.push(newEntry);
  res.status(201).json(newEntry);
});

app.get('/api/persons/:id', (req, res) => {
  const { id } = req.params;
  const entry = data.find((p) => p.id === Number(id));
  if (!entry)
    return res.status(404).json({
      error: `phonebook entry with id ${id} not found`,
    });
  res.json(entry);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((p) => p.id !== id);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listenting on port ${PORT}`);
});
