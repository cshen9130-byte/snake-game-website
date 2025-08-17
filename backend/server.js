const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());  // This will parse JSON request bodies

// Connect to MongoDB (replace with your MongoDB URI if needed)
mongoose.connect('mongodb://localhost/snake-game', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));

// Define the user schema for MongoDB
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 }
});

// Create a model for the user schema
const User = mongoose.model('User', userSchema);

// Register new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user and save to the database
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User created');
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).send('Invalid credentials');
    }

    // Create a token for the user
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.json({ token });
});

// Save the user's score
app.post('/save-score', async (req, res) => {
    const { userId, score } = req.body;

    // Find the user by ID and update the score
    const user = await User.findById(userId);
    user.score = score;
    await user.save();
    res.send('Score saved');
});

// Fetch the leaderboard
app.get('/leaderboard', async (req, res) => {
    // Get the top 10 users based on score, sorted in descending order
    const leaderboard = await User.find().sort({ score: -1 }).limit(10);
    res.json(leaderboard);
});

// Start the server on port 5000
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
