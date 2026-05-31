import { useState, useEffect, useCallback } from 'react';

type Cell = { x: number; y: number };
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const CELL = 18;
const COLS = 20;
const ROWS = 16;
const SPEED = 110;

const INITIAL_SNAKE: Cell[] = [
  { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 },
];

function randFood(snake: Cell[]): Cell {
  let pos: Cell;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [dir, setDir] = useState<Dir>('RIGHT');
  const [nextDir, setNextDir] = useState<Dir>('RIGHT');
  const [food, setFood] = useState<Cell>(() => randFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('axier-snake-hs') || '0'); } catch { return 0; }
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [overReason, setOverReason] = useState('');

  const reset = useCallback(() => {
    const s = INITIAL_SNAKE.map(c => ({ ...c }));
    setSnake(s);
    setDir('RIGHT');
    setNextDir('RIGHT');
    setFood(randFood(s));
    setScore(0);
    setOverReason('');
  }, []);

  const startGame = useCallback(() => {
    reset();
    setGameState('playing');
  }, [reset]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.key === ' ' || e.key === 'Enter') startGame();
        return;
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault();
          if (dir !== 'DOWN') setNextDir('UP');
          break;
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault();
          if (dir !== 'UP') setNextDir('DOWN');
          break;
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault();
          if (dir !== 'RIGHT') setNextDir('LEFT');
          break;
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault();
          if (dir !== 'LEFT') setNextDir('RIGHT');
          break;
        case 'Escape':
          setGameState('idle');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, dir, startGame]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
      setDir(nextDir);
      setSnake(prev => {
        const head = { ...prev[0] };
        switch (nextDir) {
          case 'UP':    head.y--; break;
          case 'DOWN':  head.y++; break;
          case 'LEFT':  head.x--; break;
          case 'RIGHT': head.x++; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          setGameState('over');
          setOverReason('You hit the wall!');
          setSnake(prev);
          return prev;
        }

        // Self collision
        if (prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameState('over');
          setOverReason('You hit yourself!');
          setSnake(prev);
          return prev;
        }

        let ate = false;
        let newFood = food;
        if (head.x === food.x && head.y === food.y) {
          ate = true;
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('axier-snake-hs', String(newScore));
          }
          newFood = randFood([head, ...prev]);
          setFood(newFood);
        }

        const next = [head, ...prev];
        if (!ate) next.pop();
        return next;
      });
    }, SPEED);
    return () => clearInterval(tick);
  }, [gameState, nextDir, food, score, highScore]);

  const px = (v: number) => v * CELL;
  const isHead = (c: Cell) => c.x === snake[0].x && c.y === snake[0].y;

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={() => onClose()} />
      <div
        className="fixed z-[91] rounded-2xl overflow-hidden flex flex-col"
        style={{
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(4, 4, 12, 0.95)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          animation: 'emoji-enter 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">🐍</span>
            <div>
              <div className="text-sm font-medium text-white/90">Snake</div>
              <div className="text-[10px] text-white/30">Score: <span className="text-cyan-400">{score}</span> · Best: <span className="text-purple-400">{highScore}</span></div>
            </div>
          </div>
          <button
            className="text-white/30 hover:text-white/70 text-sm transition-colors"
            onClick={() => onClose()}
          >
            ✕
          </button>
        </div>

        {/* Board */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: px(COLS),
            height: px(ROWS),
            background: 'linear-gradient(135deg, #0a0a1a, #0d0d20)',
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: `${CELL}px ${CELL}px`,
            }}
          />

          {/* Snake */}
          {snake.map((cell, i) => (
            <div
              key={i}
              className="absolute rounded-sm transition-all duration-75"
              style={{
                left: px(cell.x),
                top: px(cell.y),
                width: CELL - 1,
                height: CELL - 1,
                background: isHead(cell)
                  ? '#7aa2f7'
                  : i < snake.length - 1
                    ? `hsl(${200 + i * 2}, 70%, 55%)`
                    : '#4a6fa5',
                boxShadow: isHead(cell) ? '0 0 8px #7aa2f7' : 'none',
                opacity: 1 - (i / snake.length) * 0.4,
              }}
            >
              {isHead(cell) && (
                <div className="absolute inset-0 flex items-center justify-center text-[8px]">
                  {dir === 'UP' ? '👆' : dir === 'DOWN' ? '👇' : dir === 'LEFT' ? '👈' : '👉'}
                </div>
              )}
            </div>
          ))}

          {/* Food */}
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              left: px(food.x) + 1,
              top: px(food.y) + 1,
              width: CELL - 3,
              height: CELL - 3,
              background: 'radial-gradient(circle, #ff6b6b, #ee5a5a)',
              boxShadow: '0 0 8px rgba(255,107,107,0.7)',
              animation: 'food-pulse 0.8s ease-in-out infinite alternate',
            }}
          />

          {/* Overlay screens */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
              <div className="text-4xl mb-3">🐍</div>
              <div className="text-white/80 text-sm font-medium mb-1">Snake</div>
              <div className="text-white/40 text-xs mb-4">Classic arcade game</div>
              <button
                className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7aa2f7, #89b4fa)', boxShadow: '0 4px 16px rgba(122,162,247,0.4)' }}
                onClick={startGame}
              >
                Play
              </button>
              <div className="mt-4 text-[10px] text-white/25 text-center">Arrow keys or WASD to move<br/>Esc to quit</div>
            </div>
          )}

          {gameState === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.80)' }}>
              <div className="text-4xl mb-2">💀</div>
              <div className="text-white/80 text-sm font-medium mb-1">Game Over!</div>
              <div className="text-white/40 text-xs mb-1">{overReason}</div>
              <div className="text-white/60 text-xs mb-4">Score: {score} · Best: {highScore}</div>
              <button
                className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f7768e, #ff9e64)', boxShadow: '0 4px 16px rgba(247,118,142,0.4)' }}
                onClick={startGame}
              >
                Play Again
              </button>
              <div className="mt-3 text-[10px] text-white/25">Press Space or Enter</div>
            </div>
          )}
        </div>

        {/* Controls hint */}
        <div className="px-3 py-2 flex items-center justify-center gap-2">
          {(['↑','↓','←','→'] as const).map(d => (
            <div
              key={d}
              className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-white/40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {d}
            </div>
          ))}
          <div className="text-[10px] text-white/20 ml-2">WASD also works</div>
        </div>
      </div>

      <style>{`
        @keyframes emoji-enter {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes food-pulse {
          from { transform: scale(0.85); box-shadow: 0 0 4px rgba(255,107,107,0.5); }
          to   { transform: scale(1.05); box-shadow: 0 0 12px rgba(255,107,107,0.8); }
        }
      `}</style>
    </>
  );
}
