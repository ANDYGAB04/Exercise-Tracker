const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const UserSchema = new mongoose.Schema({
  _id: String,
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
});
const User= mongoose.model('User', UserSchema);

app.post('/api/users', async (req, res) => {
 
 const username = req.body.username;
  const _id = new mongoose.Types.ObjectId().toString();
  const newUser = new User({_id: _id, username: username, count: 0, log: [] });
  await newUser.save();
  res.json({ username: username, _id: _id });

});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});
app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.params._id;
  const { description, duration, date } = req.body;
  const user = await User.findById(_id);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  user.count += 1;
  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };
  user.log.push(exercise);
  await user.save();
  res.json({ _id: _id, username: user.username, date: exercise.date.toDateString(), duration: exercise.duration, description: exercise.description });
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;
  const user = await User.findById(_id);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  let log = user.log;
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => ex.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => ex.date <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));

  }
  res.json({ _id: _id, username: user.username, count: log.length, log: log.map(ex => ({ description: ex.description, duration: ex.duration, date: ex.date.toDateString() })) });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
