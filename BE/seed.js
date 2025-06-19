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
    'umbrella', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini', 'apricot', 'blueberry', 'cantaloupe', 'dragonfruit',
    'eggplant', 'fennel', 'garlic', 'honeydew', 'jalapeño', 'kale', 'lime', 'mushroom', 'nutmeg', 'olive',
    'papaya', 'quinoa', 'radish', 'spinach', 'tomato', 'ugli', 'vanilla', 'wasabi', 'xanadu', 'yarrow',
    'zest', 'almond', 'basil', 'cinnamon', 'date', 'endive', 'feta', 'ginger', 'hummus', 'iceberg',
    'jasmine', 'ketchup', 'leek', 'miso', 'nuts', 'oatmeal', 'parsley', 'quark', 'ricotta', 'sage',
    'thyme', 'udon', 'vegan', 'walnut', 'xerch', 'yogurt', 'zinfandel', 'asparagus', 'broccoli', 'carrot',
    'dill', 'egg', 'french', 'grapefruit', 'honey', 'ice', 'jalapeño', 'kiwi', 'lemon', 'mango'
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
    'Children laugh and play in the park.',
    'Stars twinkle brightly in the night sky.',
    'A train whistles as it speeds through the countryside.',
    'Raindrops dance on the roof during a storm.',
    'A candle flickers softly in the dim room.',
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
    'On the bustling streets of a city that never sleeps, a street artist painted vibrant murals that told stories of love and loss. Each stroke of his brush breathed life into the walls, transforming them into canvases of hope. One evening, a passerby stopped, captivated by a mural that seemed to whisper secrets of the past.',
    'In a small coastal town, fishermen cast their nets at dawn, hoping for a bountiful catch. Among them was an old sailor who spoke of a legendary fish that granted wishes. Intrigued, a young girl decided to follow the sailor’s tales, embarking on a journey to find the mythical creature.',
    'A scientist in a high-tech lab discovered a way to communicate with animals. Her breakthrough led to unexpected friendships with creatures she had only observed from afar. One day, a wise old owl shared ancient knowledge that changed her understanding of the natural world.',
    'In a distant land, a prince disguised as a commoner wandered through bustling markets. He encountered a spirited merchant who sold exotic spices and rare artifacts. Intrigued by her stories, he learned about the struggles of his people, leading him to question his royal duties and seek a new path.',
    'A retired detective, living in a quiet seaside town, found solace in painting landscapes. One stormy night, a mysterious figure appeared at his door, seeking help to solve a decades-old mystery. Reluctantly, he picked up his magnifying glass once more, drawn back into a world of intrigue and danger.',
    'In a futuristic city, where technology ruled every aspect of life, a young hacker discovered a hidden network of rebels fighting against the oppressive regime. Intrigued by their cause, she decided to join them, using her skills to uncover secrets that could change the fate of the city forever.',
    'A young girl with a passion for astronomy spent her nights gazing at the stars, dreaming of distant worlds. One evening, she stumbled upon a hidden observatory, where an eccentric scientist revealed the secrets of the universe. Together, they embarked on a journey through space and time, exploring the wonders of the cosmos.',
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