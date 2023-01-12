const express = require('express');

const app = express();

const data = [
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

app.get('/api/persons', (req, res) => {
  res.send(data);
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listenting on port ${PORT}`);
});
