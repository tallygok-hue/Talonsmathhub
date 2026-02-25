import { useState, useRef, useCallback, useEffect } from 'react';

interface MathHomeProps {
  onSecretAccess: () => void;
  isAuthenticated: boolean;
  onGoToGames: () => void;
}

// Math quiz data
const quizQuestions = [
  { q: 'What is 15 × 7?', options: ['95', '105', '115', '85'], correct: 1 },
  { q: 'Solve: 2x + 6 = 18', options: ['x = 4', 'x = 6', 'x = 8', 'x = 12'], correct: 1 },
  { q: 'What is √144?', options: ['11', '12', '13', '14'], correct: 1 },
  { q: 'What is 3⁴?', options: ['12', '27', '81', '64'], correct: 2 },
  { q: 'Simplify: 4/8', options: ['1/4', '2/4', '1/2', '3/4'], correct: 2 },
  { q: 'What is 25% of 200?', options: ['25', '50', '75', '100'], correct: 1 },
  { q: 'Area of a circle with r=5?', options: ['25π', '10π', '50π', '5π'], correct: 0 },
  { q: 'What is 13²?', options: ['156', '169', '144', '196'], correct: 1 },
  { q: 'Solve: 5x - 3 = 22', options: ['x = 3', 'x = 4', 'x = 5', 'x = 25'], correct: 2 },
  { q: 'What is the slope of y = 3x + 7?', options: ['7', '3', '21', '10'], correct: 1 },
];

const topics = [
  { name: 'Algebra', icon: '📐', desc: 'Linear equations, polynomials, and functions', color: 'from-blue-500 to-blue-600' },
  { name: 'Geometry', icon: '📏', desc: 'Shapes, angles, area, and volume', color: 'from-green-500 to-green-600' },
  { name: 'Calculus', icon: '📈', desc: 'Limits, derivatives, and integrals', color: 'from-purple-500 to-purple-600' },
  { name: 'Statistics', icon: '📊', desc: 'Data analysis, probability, distributions', color: 'from-orange-500 to-orange-600' },
  { name: 'Trigonometry', icon: '📉', desc: 'Sin, cos, tan, and identities', color: 'from-red-500 to-red-600' },
  { name: 'Number Theory', icon: '🔢', desc: 'Primes, divisibility, and modular arithmetic', color: 'from-teal-500 to-teal-600' },
];

const formulas = [
  { name: 'Quadratic Formula', formula: 'x = (-b ± √(b²-4ac)) / 2a' },
  { name: 'Pythagorean Theorem', formula: 'a² + b² = c²' },
  { name: 'Slope Formula', formula: 'm = (y₂ - y₁) / (x₂ - x₁)' },
  { name: 'Distance Formula', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)' },
  { name: 'Area of Circle', formula: 'A = πr²' },
  { name: 'Volume of Sphere', formula: 'V = (4/3)πr³' },
  { name: 'Law of Cosines', formula: 'c² = a² + b² - 2ab·cos(C)' },
  { name: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt)' },
];

// Simple calculator component
function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const inputDigit = (d: string) => {
    if (fresh) {
      setDisplay(d);
      setFresh(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  };

  const inputDot = () => {
    if (fresh) {
      setDisplay('0.');
      setFresh(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const doOp = (nextOp: string) => {
    const val = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const p = parseFloat(prev);
      let result = 0;
      switch (op) {
        case '+': result = p + val; break;
        case '-': result = p - val; break;
        case '×': result = p * val; break;
        case '÷': result = val !== 0 ? p / val : 0; break;
      }
      setPrev(String(result));
      setDisplay(String(result));
    } else {
      setPrev(String(val));
    }
    setOp(nextOp);
    setFresh(true);
  };

  const doEquals = () => {
    if (prev !== null && op) {
      const p = parseFloat(prev);
      const val = parseFloat(display);
      let result = 0;
      switch (op) {
        case '+': result = p + val; break;
        case '-': result = p - val; break;
        case '×': result = p * val; break;
        case '÷': result = val !== 0 ? p / val : 0; break;
      }
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setFresh(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const btn = (label: string, onClick: () => void, cls: string = '') => (
    <button
      key={label}
      onClick={onClick}
      className={`p-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 active:scale-95 ${cls}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs mx-auto">
      <div className="bg-gray-900 text-white text-right text-3xl p-4 rounded-xl mb-4 font-mono min-h-[60px] flex items-center justify-end overflow-hidden">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {btn('C', clear, 'bg-red-100 text-red-600 col-span-2')}
        {btn('÷', () => doOp('÷'), 'bg-blue-100 text-blue-600')}
        {btn('×', () => doOp('×'), 'bg-blue-100 text-blue-600')}
        {btn('7', () => inputDigit('7'), 'bg-gray-100')}
        {btn('8', () => inputDigit('8'), 'bg-gray-100')}
        {btn('9', () => inputDigit('9'), 'bg-gray-100')}
        {btn('-', () => doOp('-'), 'bg-blue-100 text-blue-600')}
        {btn('4', () => inputDigit('4'), 'bg-gray-100')}
        {btn('5', () => inputDigit('5'), 'bg-gray-100')}
        {btn('6', () => inputDigit('6'), 'bg-gray-100')}
        {btn('+', () => doOp('+'), 'bg-blue-100 text-blue-600')}
        {btn('1', () => inputDigit('1'), 'bg-gray-100')}
        {btn('2', () => inputDigit('2'), 'bg-gray-100')}
        {btn('3', () => inputDigit('3'), 'bg-gray-100')}
        {btn('=', doEquals, 'bg-blue-600 text-white row-span-2')}
        {btn('0', () => inputDigit('0'), 'bg-gray-100 col-span-2')}
        {btn('.', inputDot, 'bg-gray-100')}
      </div>
    </div>
  );
}

// Quiz component
function MathQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === quizQuestions[currentQ].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrentQ(currentQ + 1);
      setAnswered(false);
      setSelected(-1);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswered(false);
    setSelected(-1);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}</div>
        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
        <p className="text-xl text-gray-600 mb-4">Score: {score}/{quizQuestions.length}</p>
        <p className="text-gray-500 mb-6">
          {score >= 8 ? 'Outstanding! You\'re a math whiz!' : score >= 5 ? 'Good job! Keep practicing!' : 'Keep studying, you\'ll get better!'}
        </p>
        <button onClick={restart} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const q = quizQuestions[currentQ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Question {currentQ + 1}/{quizQuestions.length}</span>
        <span className="text-sm font-semibold text-blue-600">Score: {score}</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800">{q.q}</h3>
      </div>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
              answered
                ? idx === q.correct
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : idx === selected
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-400'
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <button onClick={nextQuestion} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          {currentQ + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  );
}

// Flashcard practice
function FlashCards() {
  const cards = [
    { front: 'What is the derivative of x²?', back: '2x' },
    { front: 'What is sin(90°)?', back: '1' },
    { front: 'What is log₁₀(1000)?', back: '3' },
    { front: 'What is the integral of 2x dx?', back: 'x² + C' },
    { front: 'What is cos(0°)?', back: '1' },
    { front: 'Factor: x² - 9', back: '(x+3)(x-3)' },
    { front: 'What is 7! ?', back: '5040' },
    { front: 'Simplify: (x³)²', back: 'x⁶' },
  ];

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="max-w-md mx-auto text-center">
      <p className="text-sm text-gray-500 mb-4">Card {idx + 1} of {cards.length} — Click to flip</p>
      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 min-h-[200px] flex items-center justify-center cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]"
      >
        <p className="text-2xl font-bold text-white">
          {flipped ? cards[idx].back : cards[idx].front}
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-2 mb-4">{flipped ? '(Answer)' : '(Question)'}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => { setIdx((idx - 1 + cards.length) % cards.length); setFlipped(false); }}
          className="px-6 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => { setIdx((idx + 1) % cards.length); setFlipped(false); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export function MathHome({ onSecretAccess, isAuthenticated, onGoToGames }: MathHomeProps) {
  const [activeSection, setActiveSection] = useState('home');
  
  // Use ref for click count so it persists across re-renders and section changes
  const secretClicksRef = useRef(0);
  const secretTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSecret = useCallback(() => {
    if (isAuthenticated) {
      onGoToGames();
    } else {
      onSecretAccess();
    }
  }, [isAuthenticated, onGoToGames, onSecretAccess]);

  // Secret click handler - click the copyright/pi area 5 times within 4 seconds
  const handleSecretClick = useCallback(() => {
    secretClicksRef.current += 1;
    
    // Reset timer - clicks must happen within 4 seconds
    if (secretTimerRef.current) {
      clearTimeout(secretTimerRef.current);
    }
    secretTimerRef.current = setTimeout(() => {
      secretClicksRef.current = 0;
    }, 4000);

    if (secretClicksRef.current >= 5) {
      secretClicksRef.current = 0;
      if (secretTimerRef.current) {
        clearTimeout(secretTimerRef.current);
      }
      triggerSecret();
    }
  }, [triggerSecret]);

  // BACKUP: Keyboard shortcut - press Ctrl+Shift+G to access
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        triggerSecret();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [triggerSecret]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              π
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Talon's Math Hub</h1>
              <p className="text-xs text-gray-500">Free Math Resources for Students</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {['home', 'topics', 'quiz', 'flashcards', 'calculator', 'formulas'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`text-sm font-medium capitalize transition-colors ${
                  activeSection === s ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2"
            >
              {['home', 'topics', 'quiz', 'flashcards', 'calculator', 'formulas'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content - flex-1 pushes footer down */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {activeSection === 'home' && (
          <div>
            {/* Hero */}
            <div className="text-center py-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Master Math, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">One Step at a Time</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Free practice quizzes, flashcards, calculator tools, and formula references. Everything you need to ace your math class.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => setActiveSection('quiz')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Start Quiz →
                </button>
                <button
                  onClick={() => setActiveSection('topics')}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Browse Topics
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { label: 'Topics', value: '6+', icon: '📚' },
                { label: 'Quiz Questions', value: '10+', icon: '❓' },
                { label: 'Flashcards', value: '8+', icon: '🃏' },
                { label: 'Formulas', value: '8+', icon: '📝' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Featured Topics Grid */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {topics.slice(0, 3).map((t) => (
                <div
                  key={t.name}
                  onClick={() => setActiveSection('topics')}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {t.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Tip of the day */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <h3 className="text-xl font-bold mb-2">💡 Math Tip of the Day</h3>
              <p className="text-blue-100 text-lg">
                Remember: When solving equations, whatever you do to one side, you must do to the other. 
                This keeps the equation balanced, just like a scale!
              </p>
            </div>
          </div>
        )}

        {activeSection === 'topics' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Math Topics</h2>
            <p className="text-gray-600 mb-8">Explore different branches of mathematics</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl mb-4`}>
                    {t.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.name}</h3>
                  <p className="text-gray-500 mb-4">{t.desc}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <span>Practice questions available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'quiz' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Math Quiz</h2>
            <p className="text-gray-600 mb-8">Test your knowledge with these practice questions</p>
            <MathQuiz />
          </div>
        )}

        {activeSection === 'flashcards' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h2>
            <p className="text-gray-600 mb-8">Click to flip and reveal the answer</p>
            <FlashCards />
          </div>
        )}

        {activeSection === 'calculator' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Calculator</h2>
            <p className="text-gray-600 mb-8">A simple calculator for quick computations</p>
            <Calculator />
          </div>
        )}

        {activeSection === 'formulas' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Formula Reference</h2>
            <p className="text-gray-600 mb-8">Common math formulas you need to know</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formulas.map((f) => (
                <div key={f.name} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{f.name}</h4>
                  <code className="text-lg text-blue-600 font-mono bg-blue-50 px-3 py-1 rounded-lg">{f.formula}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============================================ */}
      {/* FOOTER - Secret access is hidden in here     */}
      {/* Click the © copyright text 5 times OR        */}
      {/* Click the small π at bottom right 5 times    */}
      {/* OR press Ctrl+Shift+G anywhere on the page   */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  π
                </div>
                <span className="text-white font-bold">Talon&apos;s Math Hub</span>
              </div>
              <p className="text-sm leading-relaxed">Free math resources for students of all levels. Practice, learn, and improve your skills.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setActiveSection('quiz')} className="hover:text-white transition-colors">Practice Quizzes</button></li>
                <li><button onClick={() => setActiveSection('flashcards')} className="hover:text-white transition-colors">Flashcards</button></li>
                <li><button onClick={() => setActiveSection('calculator')} className="hover:text-white transition-colors">Calculator</button></li>
                <li><button onClick={() => setActiveSection('formulas')} className="hover:text-white transition-colors">Formulas</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Topics</h4>
              <ul className="space-y-2 text-sm">
                {topics.slice(0, 4).map(t => (
                  <li key={t.name}>
                    <button onClick={() => setActiveSection('topics')} className="hover:text-white transition-colors">{t.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar with SECRET click targets */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* SECRET CLICK TARGET 1: The copyright text */}
            <button
              onClick={handleSecretClick}
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors select-none cursor-default focus:outline-none"
              aria-label="Copyright"
            >
              © 2024 Talon&apos;s Math Hub. All rights reserved.
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">Made for students</span>
              
              {/* SECRET CLICK TARGET 2: The π symbol */}
              <button
                onClick={handleSecretClick}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-500 transition-colors text-xl select-none focus:outline-none rounded-full"
                aria-label="Pi symbol"
              >
                π
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
