const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  trials: { type: Number, default: 0 },
});

const User = mongoose.model('User', UserSchema);

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/typing/text', async (req, res) => {
  const { type } = req.query;
  let text = '';
  const words = ['happy', 'sunny', 'cloud', 'dream', 'smile', 'river', 'tree', 'star', 'moon', 'love'];
  const sentences = [
    'The happy sun shines brightly.',
    'A little bird sings in the tree.',
    'Stars twinkle in the night sky.',
    'The river flows gently through the valley.',
    'A warm smile makes the day better.',
  ];
  const paragraphs = [
    'In a quiet forest, the sun peeked through the trees. Birds chirped softly, and a gentle breeze rustled the leaves. A small rabbit hopped along the path, curious about the new day. Everything felt calm and happy, as if the world was smiling.',
    'The moon glowed brightly over the calm lake. Stars reflected on the water, creating a sparkling dance. A soft wind whispered through the reeds, and an owl hooted in the distance. It was a peaceful night, full of wonder and quiet beauty.',
  ];

  if (type === 'word') {
    text = words[Math.floor(Math.random() * words.length)];
  } else if (type === 'sentence') {
    text = sentences[Math.floor(Math.random() * sentences.length)];
  } else if (type === 'paragraph') {
    text = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  } else {
    return res.status(400).json({ message: 'Invalid text type' });
  }

  res.json({ text });
});

app.get('/api/typing/trials', authenticateToken, async (req, res) => {
  try {
    res.json({ trials: req.user.trials });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/typing/trials', authenticateToken, async (req, res) => {
  try {
    req.user.trials = req.body.trials || req.user.trials + 1;
    await req.user.save();
    res.json({ trials: req.user.trials });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));