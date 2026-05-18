import React, { useState, useEffect, useRef, useCallback } from 'react';

type Point = { x: number; y: number };
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

const playSound = (type: 'eat' | 'die') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'eat') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.1);
      
      const oscillator2 = audioCtx.createOscillator();
      oscillator2.type = 'sawtooth';
      oscillator2.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.15);
      oscillator2.connect(gainNode);
      oscillator2.start(audioCtx.currentTime);
      oscillator2.stop(audioCtx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'die') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);

      const oscillator2 = audioCtx.createOscillator();
      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(750, audioCtx.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5);
      oscillator2.connect(gainNode);
      oscillator2.start(audioCtx.currentTime);
      oscillator2.stop(audioCtx.currentTime + 0.5);

      const bufferSize = audioCtx.sampleRate * 0.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      noiseFilter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.5);
      noise.connect(noiseFilter);
      noiseFilter.connect(gainNode);
      noise.start(audioCtx.currentTime);
      noise.stop(audioCtx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreUpdate }) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number | null>(null);

  // Focus the game board automatically
  const boardRef = useRef<HTMLDivElement>(null);

  const spawnFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    onScoreUpdate(0);
    setIsGameOver(false);
    setIsPaused(false);
    spawnFood(INITIAL_SNAKE);
    if (boardRef.current) boardRef.current.focus();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (isGameOver) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      if (e.key === ' ' || e.key === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      if (isPaused) return;

      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
      setDirection(directionRef.current);
    },
    [isGameOver, isPaused]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    const head = snake[0];
    const newHead = {
      x: head.x + directionRef.current.x,
      y: head.y + directionRef.current.y,
    };

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      playSound('die');
      setIsGameOver(true);
      return;
    }

    // Check self collision
    if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      playSound('die');
      setIsGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
      playSound('eat');
      const newScore = score + 10;
      setScore(newScore);
      onScoreUpdate(newScore);
      spawnFood(newSnake);
    } else {
      newSnake.pop(); // Remove tail if no food eaten
    }

    setSnake(newSnake);
  }, [snake, food, isGameOver, isPaused, score, onScoreUpdate, spawnFood]);

  const savedCallback = useRef(moveSnake);

  useEffect(() => {
    savedCallback.current = moveSnake;
  }, [moveSnake]);

  useEffect(() => {
    const speed = Math.max(60, 250 - score * 3); // Starts slower, gets faster as you score
    gameLoopRef.current = window.setInterval(() => savedCallback.current(), speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [score]);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-0">
      {/* Game Board */}
      <div
        ref={boardRef}
        tabIndex={0}
        className="w-full h-full relative outline-none overflow-hidden bg-black border border-[#0ff]/50 shadow-[0_0_20px_rgba(0,255,255,0.2)] rounded-sm"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          aspectRatio: '1 / 1'
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)', backgroundSize: '5% 5%' }}></div>

        {/* Draw Snake */}
        {snake.map((segment, index) => (
          <div
            key={`snake-${index}`}
            className={index === 0 ? 'snake-head' : 'snake-body'}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1,
            }}
          />
        ))}

        {/* Draw Food */}
        <div
          className="food flex items-center justify-center text-[min(16px,2.5vw)] sm:text-[min(20px,3vw)]"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
          }}
        >🔥</div>

        {/* Overlays */}
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 p-2 sm:p-4">
            {isGameOver ? (
              <div className="text-center animate-pulse flex flex-col items-center justify-center p-3 sm:p-6 border-2 sm:border-4 border-[#f0f] shadow-[0_0_15px_#f0f] bg-black max-w-[95%]">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-['Press_Start_2P'] text-[#f0f] mb-4 sm:mb-8 drop-shadow-[2px_2px_0_#000,0_0_10px_#f0f]">
                  GAME OVER
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetGame();
                  }}
                  className="font-['Press_Start_2P'] text-[#0ff] hover:text-white bg-transparent hover:bg-[#0ff] px-3 py-2 sm:px-6 sm:py-4 border-2 border-[#0ff] shadow-[0_0_15px_#0ff] transition-colors cursor-pointer text-xs sm:text-base lg:text-xl w-full"
                >
                  START
                </button>
              </div>
            ) : (
              <div className="text-center p-3 sm:p-6 border-2 border-[#0ff] bg-black shadow-[0_0_20px_#0ff] max-w-[95%]">
                <h2 className="text-xl sm:text-3xl font-['Press_Start_2P'] text-[#0ff] mb-2 sm:mb-4">
                  PAUSED
                </h2>
                <p className="text-white font-['Press_Start_2P'] text-[10px] sm:text-xs tracking-widest animate-pulse">
                  PRESS SPACE TO RESUME
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
