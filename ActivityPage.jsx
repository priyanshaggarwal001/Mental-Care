import React, { useMemo, useState } from "react";
import "./WellnessShared.css";
import "./ActivityPage.css";
import { recordActivitySession } from "./wellnessStats";

const ACTIVITIES = [
  {
    id: "breathing",
    name: "Deep Breathing",
    description: "Inhale for 4, hold for 4, exhale for 6. Repeat calmly.",
    minutes: 3,
  },
  {
    id: "grounding",
    name: "5-4-3-2-1 Grounding",
    description: "Notice 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.",
    minutes: 5,
  },
  {
    id: "mindful",
    name: "Mindful Reset",
    description: "Sit still and observe thoughts without judgement.",
    minutes: 10,
  },
];

const AUDIO_TRACKS = [
  {
    id: "rain",
    title: "Rain Ambience",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "focus",
    title: "Focus Flow",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "calm",
    title: "Calm Session",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ActivityPage() {
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITIES[0]);
  const [secondsLeft, setSecondsLeft] = useState(ACTIVITIES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeTrackId, setActiveTrackId] = useState(AUDIO_TRACKS[0].id);

  const totalSeconds = useMemo(() => selectedActivity.minutes * 60, [selectedActivity]);
  const progress = useMemo(() => {
    const done = totalSeconds - secondsLeft;
    return Math.max(0, Math.min(100, (done / totalSeconds) * 100));
  }, [secondsLeft, totalSeconds]);

  React.useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          setCompletedCount((count) => count + 1);
          recordActivitySession(selectedActivity.minutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, selectedActivity.minutes]);

  function pickActivity(activity) {
    setRunning(false);
    setSelectedActivity(activity);
    setSecondsLeft(activity.minutes * 60);
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(selectedActivity.minutes * 60);
  }

  function completeNow() {
    setRunning(false);
    setSecondsLeft(0);
    setCompletedCount((count) => count + 1);
    recordActivitySession(selectedActivity.minutes);
  }

  return (
    <div className="wellness-page">
      <div className="wellness-card activity-card">
        <h1 className="wellness-title">Mental Activities</h1>
        <p className="wellness-subtitle">Timers, calming tracks, and quick support in one place.</p>

        <div className="activity-grid">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.id}
              type="button"
              className={`activity-pill ${selectedActivity.id === activity.id ? "active" : ""}`}
              onClick={() => pickActivity(activity)}
            >
              <span>{activity.name}</span>
              <small>{activity.minutes} min</small>
            </button>
          ))}
        </div>

        <div className="activity-main">
          <h2>{selectedActivity.name}</h2>
          <p>{selectedActivity.description}</p>

          <div className="timer-wrap">
            <div className="timer-value">{formatTime(secondsLeft)}</div>
            <div className="timer-track">
              <div className="timer-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="wellness-btn-row">
            <button type="button" className="wellness-btn" onClick={() => setRunning((v) => !v)}>
              {running ? "Pause" : "Start"}
            </button>
            <button type="button" className="wellness-btn" onClick={resetTimer}>Reset</button>
            <button type="button" className="wellness-btn" onClick={completeNow}>Mark Complete</button>
          </div>

          <p className="activity-done">Completed today in this session: {completedCount}</p>
        </div>

        <div className="audio-section">
          <h3>Calm Audio</h3>
          <div className="audio-pills">
            {AUDIO_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`audio-pill ${activeTrackId === track.id ? "active" : ""}`}
                onClick={() => setActiveTrackId(track.id)}
              >
                {track.title}
              </button>
            ))}
          </div>
          <audio controls className="audio-player" src={AUDIO_TRACKS.find((track) => track.id === activeTrackId)?.url} />
        </div>

        <div className="call-card">
          <h3>Need to talk now?</h3>
          <p>If things feel urgent, call trusted support immediately.</p>
          <div className="wellness-btn-row">
            <a className="wellness-btn call-link" href="tel:988">Call 988</a>
            <a className="wellness-btn call-link" href="tel:112">Emergency 112</a>
          </div>
        </div>
      </div>
    </div>
  );
}
