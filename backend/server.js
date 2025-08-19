const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors()); // allow frontend requests

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI environment variable not set");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// --- User schema ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    highScore: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// --- JWT Middleware ---
const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Access denied');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch {
        res.status(400).send('Invalid token');
    }
};

// --- Auth routes ---
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send('Missing username or password');

        const exists = await User.findOne({ username });
        if (exists) return res.status(400).send('Username already taken');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).send('User created');
    } catch {
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        // Calculate rank
        const betterPlayers = await User.countDocuments({ highScore: { $gt: user.highScore } });
        const rank = betterPlayers + 1;

        res.json({
            token,
            userId: user._id,
            username: user.username,
            highScore: user.highScore,
            rank
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

// --- Game routes ---
app.post('/save-score', auth, async (req, res) => {
    try {
        const { score } = req.body;
        if (typeof score !== 'number') return res.status(400).send('Invalid score');

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).send('User not found');

        // Update highScore if new score is higher
        if (score > user.highScore) {
            user.highScore = score;
            await user.save();
        }

        // Calculate updated rank
        const betterPlayers = await User.countDocuments({ highScore: { $gt: user.highScore } });
        const rank = betterPlayers + 1;

        res.json({ highScore: user.highScore, rank });
    } catch {
        res.status(500).send('Error saving score');
    }
});

// Leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.find({}, 'username highScore')
            .sort({ highScore: -1 })
            .limit(10);
        res.json(leaderboard);
    } catch {
        res.status(500).send('Error fetching leaderboard');
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/health', (req, res) => res.send('Snake Game Backend is running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
