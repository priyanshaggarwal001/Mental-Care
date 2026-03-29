import React, { useEffect, useRef, useState } from "react";
import "./WellnessShared.css";
import "./MoodGamePage.css";
import { recordMoodGame } from "./wellnessStats";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;

const GOOD_OBJECTS = [
  { symbol: "🌿", points: 2 },
  { symbol: "☁️", points: 1 },
  { symbol: "💧", points: 3 },
];

const BAD_OBJECTS = [
  { symbol: "⚡", points: -2 },
  { symbol: "🔥", points: -3 },
  { symbol: "😞", points: -1 },
];

const BONUS_OBJECTS = [
  { symbol: "✨", points: 5 },
  { symbol: "💎", points: 7 },
];

const HEAL_OBJECT = { symbol: "💚", points: 0 };

function getSpeed(level) {
  if (level === "easy") return 2;
  if (level === "medium") return 4;
  return 6;
}

function getResultMessage(score) {
  if (score > 25) return "Amazing calm!";
  if (score > 10) return "Good job!";
  return "Relax more";
}

export default function MoodGamePage() {
  const [phase, setPhase] = useState("mood");
  const [selectedLevel, setSelectedLevel] = useState("easy");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [result, setResult] = useState(null);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const runningRef = useRef(false);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(30);
  const speedRef = useRef(2);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const levelRef = useRef(1);
  const feedbackRef = useRef("");
  const feedbackTicksRef = useRef(0);
  const targetXRef = useRef(180);
  const playerRef = useRef({ x: 180, y: 550, width: PLAYER_WIDTH, height: PLAYER_HEIGHT });
  const objectsRef = useRef([]);

  const setFeedback = (text) => {
    feedbackRef.current = text;
    feedbackTicksRef.current = 45;
  };

  const clearGameTimers = () => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const endGame = (reason = "time") => {
    runningRef.current = false;
    clearGameTimers();
    recordMoodGame();

    const finalScore = scoreRef.current;
    setResult({
      score: finalScore,
      message: getResultMessage(finalScore),
      bestCombo: bestComboRef.current,
      level: levelRef.current,
      reason,
    });
    setPhase("result");
  };

  const spawnObject = () => {
    const roll = Math.random();
    let item;
    let kind;

    if (roll < 0.08) {
      item = BONUS_OBJECTS[Math.floor(Math.random() * BONUS_OBJECTS.length)];
      kind = "bonus";
    } else if (roll < 0.12) {
      item = HEAL_OBJECT;
      kind = "heal";
    } else if (roll < 0.48) {
      item = BAD_OBJECTS[Math.floor(Math.random() * BAD_OBJECTS.length)];
      kind = "bad";
    } else {
      item = GOOD_OBJECTS[Math.floor(Math.random() * GOOD_OBJECTS.length)];
      kind = "good";
    }

    objectsRef.current.push({
      x: Math.random() * (CANVAS_WIDTH - 40) + 20,
      y: 0,
      symbol: item.symbol,
      points: item.points,
      kind,
    });
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#e0f7fa");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const player = playerRef.current;
    player.x += (targetXRef.current - player.x) * 0.1;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) {
      player.x = CANVAS_WIDTH - player.width;
    }

    ctx.fillStyle = "#2196f3";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    for (let i = objectsRef.current.length - 1; i >= 0; i -= 1) {
      const obj = objectsRef.current[i];
      obj.y += speedRef.current;

      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.fillText(obj.symbol, obj.x, obj.y);

      const collided =
        obj.y > player.y &&
        obj.x > player.x &&
        obj.x < player.x + player.width;

      if (collided) {
        if (obj.kind === "good") {
          comboRef.current += 1;
          bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
          const comboBonus = Math.floor(comboRef.current / 3);
          scoreRef.current += obj.points + comboBonus;
          setFeedback(comboBonus > 0 ? `Nice! +${obj.points + comboBonus}` : `+${obj.points}`);
        } else if (obj.kind === "bonus") {
          comboRef.current += 1;
          bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
          scoreRef.current += obj.points + 2;
          setFeedback(`Bonus +${obj.points + 2}`);
        } else if (obj.kind === "heal") {
          livesRef.current = Math.min(5, livesRef.current + 1);
          comboRef.current += 1;
          bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
          setFeedback("Life +1");
        } else {
          comboRef.current = 0;
          livesRef.current -= 1;
          scoreRef.current += obj.points;
          setFeedback(`${obj.points} and -1 life`);

          if (livesRef.current <= 0) {
            objectsRef.current.splice(i, 1);
            endGame("lives");
            return;
          }
        }

        objectsRef.current.splice(i, 1);
      } else if (obj.y > CANVAS_HEIGHT + 20) {
        if (obj.kind === "good" || obj.kind === "bonus") {
          comboRef.current = 0;
        }
        objectsRef.current.splice(i, 1);
      }
    }

    if (feedbackTicksRef.current > 0) {
      feedbackTicksRef.current -= 1;
    }

    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.font = "17px Arial";
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 28);
    ctx.fillText(`Lives: ${"💚".repeat(Math.max(0, livesRef.current))}`, 10, 52);

    ctx.textAlign = "right";
    ctx.fillText(`Time: ${timeLeftRef.current}s`, CANVAS_WIDTH - 10, 28);
    ctx.fillText(`Level: ${levelRef.current}`, CANVAS_WIDTH - 10, 52);

    ctx.textAlign = "center";
    ctx.fillStyle = "#1d4ed8";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Combo x${comboRef.current}`, CANVAS_WIDTH / 2, 28);

    if (feedbackTicksRef.current > 0 && feedbackRef.current) {
      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 20px Arial";
      ctx.fillText(feedbackRef.current, CANVAS_WIDTH / 2, 88);
    }
  };

  const loop = () => {
    if (!runningRef.current) return;

    drawFrame();
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const startGame = () => {
    clearGameTimers();

    speedRef.current = getSpeed(selectedLevel);
    scoreRef.current = 0;
    timeLeftRef.current = selectedDuration;
    livesRef.current = 3;
    comboRef.current = 0;
    bestComboRef.current = 0;
    levelRef.current = 1;
    feedbackRef.current = "";
    feedbackTicksRef.current = 0;
    targetXRef.current = 180;
    playerRef.current = { x: 180, y: 550, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    objectsRef.current = [];

    runningRef.current = true;
    setResult(null);
    setPhase("playing");

    spawnIntervalRef.current = setInterval(spawnObject, 900);

    timerIntervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      if (timeLeftRef.current > 0 && timeLeftRef.current % 8 === 0) {
        levelRef.current += 1;
        speedRef.current = Math.min(12, speedRef.current + 0.6);
        setFeedback(`Level ${levelRef.current}`);
      }

      if (timeLeftRef.current <= 0) {
        endGame("time");
      }
    }, 1000);

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const resetToStart = () => {
    clearGameTimers();
    runningRef.current = false;
    setResult(null);
    setSelectedLevel("easy");
    setSelectedDuration(30);
    setPhase("mood");
  };

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!runningRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      targetXRef.current = event.clientX - rect.left - PLAYER_WIDTH / 2;
    };

    const onKeyDown = (event) => {
      if (!runningRef.current) return;

      if (event.key === "ArrowLeft") targetXRef.current -= 30;
      if (event.key === "ArrowRight") targetXRef.current += 30;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      clearGameTimers();
      runningRef.current = false;
    };
  }, []);

  return (
    <div className="wellness-page">
      <div className="wellness-card">
        <h1 className="wellness-title">Calm Catch</h1>

        {phase === "mood" && (
          <div className="mood-game-panel">
            <p className="mood-game-text">Select your mood:</p>
            <div className="mood-game-btn-row">
              <button type="button" className="wellness-btn" onClick={() => { setSelectedLevel("easy"); setPhase("time"); }}>
                Stressed
              </button>
              <button type="button" className="wellness-btn" onClick={() => { setSelectedLevel("medium"); setPhase("time"); }}>
                Neutral
              </button>
              <button type="button" className="wellness-btn" onClick={() => { setSelectedLevel("hard"); setPhase("time"); }}>
                Calm
              </button>
            </div>
          </div>
        )}

        {phase === "time" && (
          <div className="mood-game-panel">
            <p className="mood-game-text">Select game duration:</p>
            <div className="mood-game-btn-row">
              {[20, 30, 40, 50, 60].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  className="wellness-btn"
                  onClick={() => {
                    setSelectedDuration(seconds);
                    setPhase("rules");
                  }}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "rules" && (
          <div className="mood-game-panel">
            <h2 className="mood-game-subtitle">How to play</h2>
            <p className="mood-game-rules">
              Move with mouse or arrow keys. Catch calm icons, avoid stress icons.
            </p>
            <p className="mood-game-rules">
              Good: 🌿 +2, ☁️ +1, 💧 +3
            </p>
            <p className="mood-game-rules">
              Bad: ⚡ -2, 🔥 -3, 😞 -1
            </p>
            <p className="mood-game-rules">
              Specials: ✨/💎 bonus points, 💚 gives 1 extra life (max 5)
            </p>
            <p className="mood-game-rules">
              Build combos and survive all levels for higher score.
            </p>
            <button type="button" className="wellness-btn mood-game-start" onClick={startGame}>
              Start Game
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`mood-game-canvas ${phase === "playing" ? "show" : ""}`}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="Calm Catch game area"
        />

        {phase === "result" && result && (
          <div className="mood-game-result">
            <h2>Final Score: {result.score}</h2>
            <p>{result.message}</p>
            <p>Best Combo: x{result.bestCombo}</p>
            <p>Reached Level: {result.level}</p>
            <p>Game Over By: {result.reason === "lives" ? "No lives left" : "Time up"}</p>
            <button type="button" className="wellness-btn" onClick={resetToStart}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
