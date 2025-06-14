import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './styles.css';

const Home = () => {
  const [mode, setMode] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

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
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="home-title"
      >
        Typing Speed Test
      </motion.h1>
      <div className="button-group">
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)' }}
          transition={{ duration: 0.2 }}
          onClick={() => setMode('practice')}
          className="button button-practice"
        >
          Practice
        </motion.button>
        {isLoggedIn && (
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)' }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate('/typing?mode=ai')}
            className="button button-ai"
          >
            Compete with AI
          </motion.button>
        )}
      </div>
      {mode && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="start-link-container"
        >
          <Link to={`/typing?mode=${mode}`} className="start-link">
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
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
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
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
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
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
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
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
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
  const [input, setInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [trials, setTrials] = useState(0);
  const [aiWpm, setAiWpm] = useState(40);
  const [aiText, setAiText] = useState('');
  const [isSampleGame, setIsSampleGame] = useState(false);
  const [error, setError] = useState(null);
  const [showTryMore, setShowTryMore] = useState(false);
  const [isWordModeStopped, setIsWordModeStopped] = useState(false);
  const [aiFinished, setAiFinished] = useState(false);
  const [aiFinalWpm, setAiFinalWpm] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const mode = new URLSearchParams(window.location.search).get('mode');
  const navigate = useNavigate();

  const fetchText = useCallback(async () => {
    console.log('Fetching text for type:', textType);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/typing/text?type=${textType}`);
      setText(res.data.text || '');
      setAiText('');
      setAiFinished(false);
      setAiFinalWpm(0);
      setError(null);
      setCountdown(mode === 'ai' && !isSampleGame ? 3 : null);
      setHasStartedTyping(false);
    } catch (err) {
      setError('Failed to fetch text. Please try again.');
      console.error('Error fetching text:', err);
    }
  }, [textType, mode, isSampleGame]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (mode === 'ai' && !token) {
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
  }, [mode, textType, fetchText, navigate]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);

  useEffect(() => {
    if (
      mode === 'ai' &&
      !isSampleGame &&
      text &&
      !aiFinished &&
      !isWordModeStopped &&
      countdown === null &&
      hasStartedTyping
    ) {
      const start = new Date();
      const charsPerWord = 5;
      const msPerChar = (60 / (aiWpm * charsPerWord)) * 1000;
      let index = 0;
      const aiTypingInterval = setInterval(() => {
        if (index < text.length) {
          setAiText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(aiTypingInterval);
          setAiFinished(true);
          const endTime = new Date();
          const timeTaken = (endTime - start) / 1000 / 60;
          const wordCount = text.split(' ').length || 1;
          setAiFinalWpm(Math.round(wordCount / timeTaken));
        }
      }, msPerChar);
      return () => clearInterval(aiTypingInterval);
    }
  }, [mode, isSampleGame, text, aiWpm, textType, isWordModeStopped, countdown, hasStartedTyping, aiFinished]);

  const calculateWpm = (inputText, start, end) => {
    if (!start || !end) return 0;
    const timeTaken = (end - start) / 1000 / 60;
    const wordCount = inputText.trim().split(/\s+/).length || 1;
    return timeTaken > 0 ? Math.round(wordCount / timeTaken) : 0;
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!hasStartedTyping && value) {
      setHasStartedTyping(true);
    }

    if (value === text) {
      const endTime = new Date();
      const finalWpm = calculateWpm(value, startTime, endTime);
      setWpm(finalWpm);

      if (isSampleGame) {
        setAiWpm(finalWpm);
        setIsSampleGame(false);
        setInput('');
        setAiText('');
        setWpm(0);
        setStartTime(null);
        setAiFinished(false);
        setAiFinalWpm(0);
        fetchText();
        return;
      }

      if (mode === 'ai') {
        setAiWpm((prev) => (prev + finalWpm) / 2);
      }

      const token = localStorage.getItem('token');
      if (!token && trials >= 3) {
        navigate('/login');
      } else {
        axios
          .post(
            `${import.meta.env.VITE_BACKEND_URL}/api/typing/trials`,
            { trials: trials + 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => setTrials(trials + 1))
          .catch(() => setTrials(trials + 1));

        setInput('');
        setAiText('');
        setStartTime(null);
        setAiFinished(false);
        setAiFinalWpm(0);
        setShowTryMore(true);
        setTimeout(() => {
          setShowTryMore(false);
          setWpm(0);
        }, 5000);
      }
    }
    if (!startTime && value) setStartTime(new Date());
  };

  const handleTextTypeChange = (e) => {
    const newType = e.target.value;
    console.log('Dropdown event fired. Current textType:', textType, 'New value:', newType);
    setTextType(newType);
    setInput('');
    setAiText('');
    setWpm(0);
    setStartTime(null);
    setShowTryMore(false);
    setIsWordModeStopped(false);
    setAiFinished(false);
    setAiFinalWpm(0);
    setCountdown(null);
    setHasStartedTyping(false);
    fetchText();
  };

  const handleTryMore = () => {
    setShowTryMore(false);
    setInput('');
    setAiText('');
    setWpm(0);
    setStartTime(null);
    setAiFinished(false);
    setAiFinalWpm(0);
    setCountdown(null);
    setHasStartedTyping(false);
    fetchText();
  };

  const handleStopWords = () => {
    setIsWordModeStopped(true);
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

  const renderAiText = () => {
    if (!aiText) return null;
    return (
      <>
        {aiText}
        {!aiFinished && <span className="blinking-cursor">|</span>}
      </>
    );
  };

  const startSampleGame = () => {
    setIsSampleGame(true);
    setInput('');
    setAiText('');
    setWpm(0);
    setStartTime(null);
    setAiFinished(false);
    setAiFinalWpm(0);
    setCountdown(null);
    setHasStartedTyping(false);
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
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="typing-title"
      >
        Typing {mode === 'practice' ? 'Practice' : 'AI Challenge'}
      </motion.h1>
      {mode === 'ai' && !isSampleGame && countdown === null && (
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)' }}
          transition={{ duration: 0.2 }}
          onClick={startSampleGame}
          className="button-primary"
        >
          Play Sample Game to Set AI Speed
        </motion.button>
      )}
      {countdown !== null && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="countdown"
        >
          {countdown > 0 ? countdown : 'Start!'}
        </motion.div>
      )}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-type-select-container"
      >
        <select value={textType} onChange={handleTextTypeChange} className="text-type">
          <option value="word">Word</option>
          <option value="sentence">Sentence</option>
          <option value="paragraph">Paragraph</option>
        </select>
      </motion.div>
      <motion.p
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="typing-text"
      >
        {renderText()}
      </motion.p>
      {mode === 'ai' && (
        <motion.p
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="ai-typing-text"
        >
          AI: {renderAiText()}
        </motion.p>
      )}
      <motion.input
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        type="text"
        value={input}
        onChange={handleInput}
        className="typing-input"
        placeholder={countdown !== null ? 'Wait for countdown...' : 'Start typing...'}
        disabled={isWordModeStopped || countdown !== null}
      />
      {showTryMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="wpm-try-more-container"
        >
          <span className="wpm-comparison">
            Your WPM: {wpm} {mode === 'ai' && aiFinalWpm > 0 ? ` | AI WPM: ${aiFinalWpm}` : ''}
          </span>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}
            transition={{ duration: 0.2 }}
            onClick={handleTryMore}
            className="button-primary try-more-button"
          >
            Try More?
          </motion.button>
        </motion.div>
      )}
      {textType === 'word' && !isWordModeStopped && countdown === null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleStopWords}
          className="button-stop"
        >
          Stop
        </motion.button>
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