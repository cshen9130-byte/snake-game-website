const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());  // Parse JSON request bodies


const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI environment variable not set");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 }
});

// User model
const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send('Missing username or password');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).send('User created');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).send('Invalid credentials');
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
        res.json({ token, userId: user._id, username: user.username });
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// Save score endpoint
app.post('/save-score', async (req, res) => {
    try {
        const { userId, score } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found');

        user.score = score;
        await user.save();
        res.send('Score saved');
    } catch (err) {
        res.status(500).send('Error saving score');
    }
});

// Leaderboard endpoint
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.find().sort({ score: -1 }).limit(10);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).send('Error fetching leaderboard');
    }
});

// Health check
app.get('/', (req, res) => res.send('Snake Game Backend is running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
