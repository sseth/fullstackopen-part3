const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
console.log('connecting to db...');
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('...connected'))
  .catch((e) => console.error('error:', error.message));

const person = new mongoose.Schema({
  name: String,
  number: String,
});

person.set('toJSON', {
  transform: (doc, ob) => {
    delete ob.__v;
    ob.id = ob._id.toString();
    delete ob._id;
  },
});

module.exports = mongoose.model('Person', person);
