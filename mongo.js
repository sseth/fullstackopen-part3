const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

if (process.argv.length < 3) {
  console.log(
    'Please provide password, name, and number: ',
    'node mongo.js <password> <name> <number>'
  );
  process.exit(1);
}

const [, , password, name, number] = process.argv;
const mongoURI =
  `mongodb+srv://sseth:${password}` +
  '@cluster0.b8y9zzg.mongodb.net/phonebook' +
  '?retryWrites=true&w=majority';

const person = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', person);

const addNew = (name, number) => {
  const entry = new Person({ name, number });
  return entry
    .save()
    .then((result) => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      mongoose.connection.close();
    })
    .catch((e) => console.error(e));
};

const getEntries = () => {
  console.log('phonebook:');
  return Person.find()
    .then((persons) => {
      persons.forEach((p) => console.log(`${p.name} ${p.number}`));
      mongoose.connection.close();
    })
    .catch((e) => console.error(e));
};

mongoose
  .connect(mongoURI)
  .then(() => {
    if (name && number) addNew(name, number);
    else getEntries();
  })
  .catch((e) => console.error('could not connect: ', e.message));
