const STORAGE_KEY = 'sprachkasse_v1';

const DEFAULT_STATE = {
  name: '',
  xp: 0,
  streak: 0,
  lastLearnDate: null,
  dailyGoal: 50,
  dailyXP: 0,
  dailyDate: null,
  completedLessons: [],
  currentLessonId: 1,
  learnedWords: []
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.warn('Could not load progress:', e);
    return { ...DEFAULT_STATE };
  }
}

function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
}

function getTodayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function updateStreak(state) {
  const today = getTodayString();
  if (state.lastLearnDate === today) {
    return state;
  }

  if (!state.lastLearnDate) {
    state.streak = 1;
  } else {
    const last = new Date(state.lastLearnDate + 'T12:00:00');
    const now = new Date(today + 'T12:00:00');
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      state.streak = (state.streak || 0) + 1;
    } else if (diffDays > 1) {
      state.streak = 1;
    }
  }
  state.lastLearnDate = today;
  return state;
}

function resetDailyIfNeeded(state) {
  const today = getTodayString();
  if (state.dailyDate !== today) {
    state.dailyXP = 0;
    state.dailyDate = today;
  }
  return state;
}

function addXP(state, amount) {
  state = resetDailyIfNeeded(state);
  state.xp = (state.xp || 0) + amount;
  state.dailyXP = (state.dailyXP || 0) + amount;
  state = updateStreak(state);
  return state;
}

function markLessonComplete(state, lessonId) {
  if (!state.completedLessons.includes(lessonId)) {
    state.completedLessons.push(lessonId);
    state.completedLessons.sort((a, b) => a - b);
  }
  // Nächste Lektion setzen
  const nextId = lessonId + 1;
  if (nextId <= 100) {
    state.currentLessonId = nextId;
  }
  return state;
}

function addLearnedWord(state, wordId) {
  if (!state.learnedWords.includes(wordId)) {
    state.learnedWords.push(wordId);
  }
  return state;
}
