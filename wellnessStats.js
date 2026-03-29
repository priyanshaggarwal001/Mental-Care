const STORAGE_KEY = "wellness_stats_v1";

function dateKeyFrom(date) {
  return date.toISOString().slice(0, 10);
}

function getTodayKey() {
  return dateKeyFrom(new Date());
}

function defaultDay() {
  return {
    activityMinutes: 0,
    activitySessions: 0,
    moodGames: 0,
    consultBookings: 0,
  };
}

function defaultState() {
  return {
    goals: {
      dailyMinutes: 20,
      dailySessions: 2,
    },
    daily: {},
    processedTransactions: {},
  };
}

function readState() {
  if (typeof window === "undefined") return defaultState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      goals: {
        ...defaultState().goals,
        ...(parsed.goals || {}),
      },
      daily: parsed.daily || {},
      processedTransactions: parsed.processedTransactions || {},
    };
  } catch {
    return defaultState();
  }
}

function writeState(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureDay(state, key) {
  if (!state.daily[key]) {
    state.daily[key] = defaultDay();
  }
  return state.daily[key];
}

export function recordActivitySession(minutes = 0) {
  const state = readState();
  const day = ensureDay(state, getTodayKey());
  day.activitySessions += 1;
  day.activityMinutes += Math.max(0, Math.round(Number(minutes) || 0));
  writeState(state);
}

export function recordMoodGame() {
  const state = readState();
  const day = ensureDay(state, getTodayKey());
  day.moodGames += 1;
  writeState(state);
}

export function recordConsultBooking(transactionId) {
  const state = readState();
  if (transactionId && state.processedTransactions[transactionId]) {
    return;
  }

  const day = ensureDay(state, getTodayKey());
  day.consultBookings += 1;

  if (transactionId) {
    state.processedTransactions[transactionId] = true;
  }

  writeState(state);
}

export function getWellnessSnapshot() {
  return readState();
}

export function getDateKey(date) {
  return dateKeyFrom(date);
}

export function getDailyTotal(dayData) {
  if (!dayData) return 0;
  return dayData.activitySessions + dayData.moodGames + dayData.consultBookings;
}
