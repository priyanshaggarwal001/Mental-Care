import React, { useMemo } from "react";
import "./WellnessShared.css";
import "./ProgressPage.css";
import { getDateKey, getDailyTotal, getWellnessSnapshot } from "./wellnessStats";

function getLastNDates(days) {
  const items = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    items.push(d);
  }

  return items;
}

function getStreak(snapshot) {
  const { daily } = snapshot;
  let streak = 0;
  const pointer = new Date();

  while (true) {
    const key = getDateKey(pointer);
    if (getDailyTotal(daily[key]) > 0) {
      streak += 1;
      pointer.setDate(pointer.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function renderMonthCells(snapshot) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const cells = [];
  const offset = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < offset; i += 1) {
    cells.push({ empty: true, id: `empty-${i}` });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const key = getDateKey(date);
    const dayData = snapshot.daily[key];
    const total = getDailyTotal(dayData);
    let level = 0;
    if (total >= 5) level = 4;
    else if (total >= 3) level = 3;
    else if (total >= 2) level = 2;
    else if (total >= 1) level = 1;

    cells.push({
      empty: false,
      day,
      level,
      total,
      id: key,
    });
  }

  return cells;
}

export default function ProgressPage() {
  const snapshot = useMemo(() => getWellnessSnapshot(), []);
  const dates30 = useMemo(() => getLastNDates(30), []);
  const chartData = useMemo(
    () =>
      dates30.map((date) => {
        const key = getDateKey(date);
        const dayData = snapshot.daily[key] || {};
        return {
          key,
          label: `${date.getDate()}`,
          total: getDailyTotal(dayData),
          minutes: dayData.activityMinutes || 0,
        };
      }),
    [dates30, snapshot]
  );

  const monthlyCells = useMemo(() => renderMonthCells(snapshot), [snapshot]);
  const streak = useMemo(() => getStreak(snapshot), [snapshot]);

  const todayKey = getDateKey(new Date());
  const todayData = snapshot.daily[todayKey] || {};
  const minuteProgress = Math.min(
    100,
    Math.round(((todayData.activityMinutes || 0) / snapshot.goals.dailyMinutes) * 100)
  );
  const sessionProgress = Math.min(
    100,
    Math.round(((todayData.activitySessions || 0) / snapshot.goals.dailySessions) * 100)
  );

  const usageDays = Object.keys(snapshot.daily).filter((key) => getDailyTotal(snapshot.daily[key]) > 0).length;
  const maxTotal = Math.max(1, ...chartData.map((item) => item.total));
  const maxMinutes = Math.max(1, ...chartData.map((item) => item.minutes));

  const polylinePoints = chartData
    .map((item, index) => {
      const x = (index / (chartData.length - 1 || 1)) * 100;
      const y = 100 - (item.minutes / maxMinutes) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="wellness-page">
      <div className="wellness-card progress-card">
        <h1 className="wellness-title">Wellness Progress</h1>
        <p className="wellness-subtitle">Track consistency, streaks, and progress trends.</p>

        <div className="progress-summary">
          <div className="summary-tile">
            <h3>{streak}</h3>
            <p>Current Streak (days)</p>
          </div>
          <div className="summary-tile">
            <h3>{usageDays}</h3>
            <p>Total Active Days</p>
          </div>
          <div className="summary-tile">
            <h3>{todayData.activitySessions || 0}</h3>
            <p>Activities Today</p>
          </div>
          <div className="summary-tile">
            <h3>{todayData.moodGames || 0}</h3>
            <p>Mood Games Today</p>
          </div>
        </div>

        <div className="goal-box">
          <h2>Daily Goals</h2>
          <div className="goal-row">
            <span>Activity Minutes ({todayData.activityMinutes || 0}/{snapshot.goals.dailyMinutes})</span>
            <span>{minuteProgress}%</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width: `${minuteProgress}%` }}></div></div>

          <div className="goal-row">
            <span>Sessions Completed ({todayData.activitySessions || 0}/{snapshot.goals.dailySessions})</span>
            <span>{sessionProgress}%</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width: `${sessionProgress}%` }}></div></div>
        </div>

        <div className="calendar-box">
          <h2>Monthly Usage Calendar</h2>
          <div className="calendar-grid">
            {monthlyCells.map((cell) =>
              cell.empty ? (
                <div key={cell.id} className="calendar-cell empty"></div>
              ) : (
                <div
                  key={cell.id}
                  className={`calendar-cell level-${cell.level}`}
                  title={`${cell.id}: ${cell.total} actions`}
                >
                  {cell.day}
                </div>
              )
            )}
          </div>
        </div>

        <div className="trend-box">
          <h2>30-Day Trends</h2>

          <div className="bar-chart">
            {chartData.map((item) => (
              <div key={item.key} className="bar-item" title={`${item.key}: ${item.total} actions`}>
                <div className="bar" style={{ height: `${(item.total / maxTotal) * 100}%` }}></div>
              </div>
            ))}
          </div>

          <div className="line-chart-wrap">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
              <polyline points={polylinePoints} fill="none" stroke="#2563eb" strokeWidth="2.2" />
            </svg>
            <p className="line-note">Blue line shows daily activity minutes over last 30 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
