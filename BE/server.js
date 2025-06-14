const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  trials: { type: Number, default: 0 },
});
const User = mongoose.model('User', UserSchema);

// English Lorem Ipsum word list
const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

// Generate English Lorem Ipsum
const generateLorem = (type) => {
  const getRandomWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];
  
  if (type === 'word') {
    return { text: getRandomWord(), image: `https://via.placeholder.com/300?text=${getRandomWord()}` };
  } else if (type === 'sentence') {
    const length = Math.floor(Math.random() * 11) + 5; // 5-15 words
    const words = Array.from({ length }, getRandomWord);
    const sentence = words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
    return { text: sentence, image: 'https://via.placeholder.com/300?text=Sentence' };
  } else if (type === 'paragraph') {
    const sentences = Array.from({ length: 3 }, () => {
      const length = Math.floor(Math.random() * 11) + 5;
      const words = Array.from({ length }, getRandomWord);
      return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
    });
    return { text: sentences.join(' '), image: 'https://via.placeholder.com/300?text=Paragraph' };
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Typing Routes
app.get('/api/typing/text', (req, res) => {
  const { type = 'sentence' } = req.query;
  const textData = generateLorem(type);
  res.json(textData);
});

app.get('/api/typing/trials', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ trials: 3 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ trials: user.trials });
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/typing/trials', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { trials } = req.body;
    if (!token) return res.json({ trials });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    user.trials = trials;
    await user.save();
    res.json({ trials });
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));