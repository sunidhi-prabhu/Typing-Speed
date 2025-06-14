import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate }
 from 'react-router-dom';
 
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import './styles.css';

const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: false });

const Home = () => {
  const [mode, setMode] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleInviteFriend = () => {
    const inviteLink = `${window.location.origin}/typing?mode=compete&invite=${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied! Share with your friend.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="home-container"
    >
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="home-title"
      >
        Typing Speed Test
      </motion.h1>
      <div className="button-group">
        <motion.button
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setMode('practice')}
          className="button button-practice"
        >
          Practice
        </motion.button>
        {isLoggedIn ? (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMode('compete')}
              className="button button-compete"
            >
              Compete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              onClick={handleInviteFriend}
              className="button button-invite"
            >
              Invite Friend
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate('/typing?mode=ai')}
              className="button button-ai"
            >
              Compete with AI
            </motion.button>
          </>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="login-prompt"
          >
            Login to compete!
          </motion.p>
        )}
      </div>
      {mode && isLoggedIn && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="start-link-container"
        >
          <Link
            to={`/typing?mode=${mode}`}
            className="start-link"
          >
            Start {mode === 'practice' ? 'Practicing' : 'Competing'}
          </Link>
        </motion.div>
      )}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-links"
      >
        {!isLoggedIn && (
          <>
            <Link to="/login" className="auth-link">Login</Link> |{' '}
            <Link to="/register" className="auth-link">Register</Link>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="auth-container"
    >
      <motion.form
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleLogin}
        className="auth-form"
      >
        <h2 className="auth-title">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          type="submit"
          className="auth-button"
        >
          Login
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, { email, password });
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="auth-container"
    >
      <motion.form
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleRegister}
        className="auth-form"
      >
        <h2 className="auth-title">Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          type="submit"
          className="auth-button"
        >
          Register
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

const TypingTest = () => {
  const [textType, setTextType] = useState('sentence');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [input, setInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [trials, setTrials] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [raceParticipants, setRaceParticipants] = useState([]);
  const [aiWpm, setAiWpm] = useState(40);
  const [aiProgress, setAiProgress] = useState(0);
  const [isSampleGame, setIsSampleGame] = useState(false);
  const [error, setError] = useState(null);
  const mode = new URLSearchParams(window.location.search).get('mode');
  const invite = new URLSearchParams(window.location.search).get('invite');
  const navigate = useNavigate();

  const fetchText = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/typing/text?type=${textType}`);
      setText(res.data.text || '');
      setImage(res.data.image || '');
      setError(null);
    } catch (err) {
      setError('Failed to fetch text. Please try again.');
      console.error('Error fetching text:', err);
    }
  }, [textType]);

  useEffect(() => {
    socket.connect();

    const token = localStorage.getItem('token');
    if (mode !== 'practice' && !token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/typing/trials`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTrials(res.data.trials || 3))
      .catch(() => setTrials(3));

    fetchText();

    if (mode === 'compete' || invite) {
      socket.emit('joinRace', { invite });
      socket.on('raceUpdate', (participants) => {
        if (participants.length < 2) {
          alert('Waiting for opponent...');
          navigate('/');
        } else {
          setRaceParticipants(participants);
        }
      });
      socket.on('leaderboardUpdate', (data) => setLeaderboard(data || []));
    } else if (mode === 'ai' && !isSampleGame) {
      const aiInterval = setInterval(() => {
        setAiProgress((prev) => {
          const newProgress = prev + (aiWpm / (text.split(' ').length || 1)) * (100 / 60);
          if (newProgress >= 100) {
            clearInterval(aiInterval);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
      return () => clearInterval(aiInterval);
    }

    return () => {
      socket.off('raceUpdate');
      socket.off('leaderboardUpdate');
      socket.disconnect();
    };
  }, [mode, invite, text, isSampleGame, fetchText, navigate, aiWpm]);

  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value === text) {
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000 / 60;
      const wordCount = text.split(' ').length || 1;
      const calculatedWpm = Math.round(wordCount / timeTaken);
      setWpm(calculatedWpm);

      if (isSampleGame) {
        setAiWpm(calculatedWpm);
        setIsSampleGame(false);
        setInput('');
        fetchText();
        return;
      }

      if (mode === 'compete' || invite) {
        socket.emit('raceComplete', { wpm: calculatedWpm, userId: localStorage.getItem('token') });
      } else if (mode === 'ai') {
        setAiWpm((prev) => (prev + calculatedWpm) / 2);
      }

      const token = localStorage.getItem('token');
      if (!token && trials >= 3) {
        navigate('/login');
      } else {
        axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/typing/trials`,
          { trials: trials + 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
          .then(() => setTrials(trials + 1))
          .catch(() => setTrials(trials + 1));
        setInput('');
        setAiProgress(0);
        fetchText();
      }
    }
    if (!startTime) setStartTime(new Date());
  };

  const renderText = () => {
    if (!text) return null;
    return text.split('').map((char, i) => {
      if (i < input.length) {
        return (
          <span key={i} className={char === input[i] ? 'text-correct' : 'text-incorrect'}>
            {char}
          </span>
        );
      }
      return <span key={i}>{char}</span>;
    });
  };

  const startSampleGame = () => {
    setIsSampleGame(true);
    setInput('');
    setWpm(0);
    fetchText();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="typing-container"
    >
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="error-message"
        >
          {error}
        </motion.p>
      )}
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="typing-title"
      >
        Typing {mode === 'practice' ? 'Practice' : mode === 'ai' ? 'AI Challenge' : 'Race'}
      </motion.h1>
      {mode === 'ai' && !isSampleGame && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onClick={startSampleGame}
          className="button-primary"
        >
          Play Sample Game to Set AI Speed
        </motion.button>
      )}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-type-select-container"
      >
        <select
          value={textType}
          onChange={(e) => {
            setTextType(e.target.value);
            fetchText();
          }}
          className="text-type"
        >
          <option value="word">Words</option>
          <option value="sentence">Sentence</option>
          <option value="paragraph">Paragraph</option>
        </select>
      </motion.div>
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        src={image || 'https://via.placeholder.com/300?text=Placeholder'}
        alt="Text-related"
        className="typing-image"
      />
      <motion.p
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="typing-text"
      >
        {renderText()}
      </motion.p>
      <motion.input
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        type="text"
        value={input}
        onChange={handleInput}
        className="typing-input"
        placeholder="Start typing..."
      />
      {wpm > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="wpm-result"
        >
          Your WPM: {wpm}
        </motion.p>
      )}
      {(mode === 'compete' || invite) && raceParticipants.length > 0 && (
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="race-progress"
        >
          <h2 className="race-title">Race Progress</h2>
          {raceParticipants.map((p) => (
            <div key={p.id} className="race-participant">
              <p>{p.id}: {p.progress}%</p>
              <div className="progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="progress-fill"
                />
              </div>
            </div>
          ))}
          <h2 className="leaderboard-title">Leaderboard</h2>
          <ul className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <motion.li
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                key={i}
              >
                User {i + 1}: {entry.wpm} WPM
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
      {mode === 'ai' && !isSampleGame && (
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="ai-progress"
        >
          <h2 className="ai-title">AI Progress</h2>
          <p>AI: {aiProgress.toFixed(1)}%</p>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiProgress}%` }}
              transition={{ duration: 0.5 }}
              className="ai-progress-fill"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/typing" element={<TypingTest />} />
    </Routes>
  </Router>
);

export default App;