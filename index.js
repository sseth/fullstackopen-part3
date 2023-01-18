require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.static('build'));
app.use(express.json());

const morgan = require('morgan');
morgan.token('request-data', (req, res) => {
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

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  if (!name || !number)
    return res.status(400).json({
      error: 'name and number required',
    });

  Person.exists({ name: { $regex: name, $options: 'i' } })
    .then((entry) => {
      if (entry) {
        return res.status(400).json({
          error: `'${name}' already exists`,
        });
      }
      const newEntry = new Person({ name, number });
      newEntry.save().then((newPerson) => res.status(201).json(newPerson));
    })
    .catch((e) => next(e));
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
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

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then((entry) => {
      if (!entry)
        return res.status(404).json({ error: `entry with id ${id} not found` });
      res.status(204).end();
    })
    .catch((e) => next(e));
});

app.put('/api/persons/:id', (req, res) => {
  const { name, number } = req.body;
  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true })
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

  next(error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  setTimeout(() => console.log(`Listenting on port ${PORT}`), 1000);
});
