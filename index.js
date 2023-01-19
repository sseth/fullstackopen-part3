require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.static('build'));
app.use(express.json());

const morgan = require('morgan');
morgan.token('request-data', (req) => {
  if (Object.keys(req.body).length) return JSON.stringify(req.body);
});
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

const Person = require('./models/person');

app.get('/api', (req, res) => {
  res.send('Hello');
});

app.get('/api/info', (req, res) => {
  Person.find().then((persons) => {
    const info = `Phonebook has info for ${persons.length} ${
      persons.length === 1 ? 'person' : 'people'
    }`;
    res.send(
      `<p>${info}</p>
        <p>${Date()}</p>`
    );
  });
});

app.get('/api/persons', (req, res) => {
  Person.find().then((persons) => res.json(persons));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;
  const newEntry = new Person({ name, number });
  newEntry
    .save()
    .then((newPerson) => res.status(201).json(newPerson))
    .catch((e) => next(e));
});

app.get('/api/persons/:id', (req, res, next) => {
  const { id } = req.params;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        return res.status(404).json({
          error: `phonebook entry with id ${id} not found`,
        });
      }
      res.json(person);
    })
    .catch((e) => next(e));
});

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params;
  Person.findByIdAndDelete(id)
    .then((entry) => {
      if (!entry)
        return res.status(404).json({ error: `entry with id ${id} not found` });
      res.status(204).end();
    })
    .catch((e) => next(e));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updated) => res.json(updated))
    .catch((e) => next(e));
});

app.all('*', (req, res) => {
  res.status(404).send({ error: `unknown endpoint: ${req.path}` });
});

app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError')
    return res.status(400).send({ error: 'invalid id' });

  if (error.name === 'MongoServerError')
    return res.status(400).json({ error: error.message });

  if (error.name === 'ValidationError') {
    const msg = error.message.slice(
      error.message.startsWith('Person')
        ? 'Person validation failed: '.length
        : 'Validation failed: '.length
    );
    return res.status(400).json({ error: { type: 'validation', msg } });
  }

  next(error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  setTimeout(() => console.log(`Listening on port ${PORT}`), 1000);
});
