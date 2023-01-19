const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
console.log('connecting to db...');
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('...connected'))
  .catch((e) => console.error('error:', e.message));

const person = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minLength: [3, 'Name must be at least 3 characters long'],
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^\d{2,3}-?\d{6,}$/.test(v),
      message: () => 'Invalid number'
    },
  },
});

person.set('toJSON', {
  transform: (doc, ob) => {
    delete ob.__v;
    ob.id = ob._id.toString();
    delete ob._id;
  },
});

module.exports = mongoose.model('Person', person);
