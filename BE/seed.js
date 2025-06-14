const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const textSchema = new mongoose.Schema({
  type: String,
  text: String,
  image: String,
});
const Text = mongoose.model('Text', textSchema);

const generateWords = () => {
  const words = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honey', 'ice', 'jam',
    'kiwi', 'lemon', 'mango', 'nectar', 'orange', 'peach', 'quince', 'raspberry', 'strawberry', 'tangerine',
    // ... Add more to reach 200 unique words
  ];
  return Array.from({ length: 200 }, (_, i) => ({
    type: 'word',
    text: words[i % words.length],
    image: `https://via.placeholder.com/300?text=${words[i % words.length]}`,
  }));
};

const generateSentences = () => {
  const sentences = [
    'The sun sets slowly behind the mountain.',
    'A cat naps peacefully on the windowsill.',
    'Waves crash gently against the shore.',
    'The forest hums with life at dawn.',
    'A warm breeze carries the scent of flowers.',
    // ... Add more to reach 200 unique sentences
  ];
  return Array.from({ length: 200 }, (_, i) => ({
    type: 'sentence',
    text: sentences[i % sentences.length],
    image: `https://via.placeholder.com/300?text=Scene${i % 5 + 1}`,
  }));
};

const generateParagraphs = () => {
  const paragraphs = [
    'In a quiet village nestled between rolling hills, a young baker named Lila woke each dawn to knead dough. Her bakery filled the air with the scent of fresh bread, drawing villagers from far and wide. One day, a mysterious traveler arrived, seeking a loaf said to hold a secret recipe.',
    'The ancient forest stood tall, its canopy a mosaic of green. Deep within, a hidden glade glowed under moonlight, where creatures of legend gathered. A young explorer, armed with only a map and courage, ventured in, hoping to uncover the forest’s long-lost tale.',
    // ... Add more to reach 200 unique paragraphs
  ];
  return Array.from({ length: 200 }, (_, i) => ({
    type: 'paragraph',
    text: paragraphs[i % paragraphs.length],
    image: `https://via.placeholder.com/300?text=Story${i % 5 + 1}`,
  }));
};

const seedDB = async () => {
  await Text.deleteMany({});
  const texts = [...generateWords(), ...generateSentences(), ...generateParagraphs()];
  await Text.insertMany(texts);
  console.log('Database seeded');
  mongoose.connection.close();
};

seedDB();