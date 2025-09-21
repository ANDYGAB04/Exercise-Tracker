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
    duratation: Number,
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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
