window.appState = loadProgress();
window.appState = resetDailyIfNeeded(window.appState);

window.onCorrectAnswer = function (xpGain) {
  window.appState = addXP(window.appState, xpGain);
  saveProgress(window.appState);
};

window.onLessonComplete = function (lessonId, bonusXP) {
  window.appState = addXP(window.appState, bonusXP);
  window.appState = markLessonComplete(window.appState, lessonId);
  saveProgress(window.appState);
  updateDashboard();
  renderLearningPath();
};

// Navigation
document.querySelectorAll('[data-page]').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page) showPage(page);
  });
});

// Continue button
document.getElementById('btn-continue')?.addEventListener('click', () => {
  const id = window.appState.currentLessonId || 1;
  startLessonView(id);
});

// Lesson controls
document.getElementById('btn-back-lesson')?.addEventListener('click', () => {
  showPage('learn');
});

document.getElementById('btn-check')?.addEventListener('click', () => {
  checkAnswer();
});

document.getElementById('btn-next')?.addEventListener('click', () => {
  nextExercise();
});

// Hints
document.querySelectorAll('.hint-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.hint;
    if (type) showHint(type);
  });
});

// Dictionary search
document.getElementById('dict-search')?.addEventListener('input', (e) => {
  renderDictionary(e.target.value);
});

// Profile name
document.getElementById('btn-save-name')?.addEventListener('click', () => {
  const input = document.getElementById('profile-name');
  const name = (input?.value || '').trim().slice(0, 40);
  window.appState.name = name;
  saveProgress(window.appState);
  updateProfile();
  updateDashboard();
  // Kurzes Feedback
  const btn = document.getElementById('btn-save-name');
  const old = btn.textContent;
  btn.textContent = 'Gespeichert';
  setTimeout(() => { btn.textContent = old; }, 1500);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  window.appState = loadProgress();
  window.appState = resetDailyIfNeeded(window.appState);
  saveProgress(window.appState);
  showPage('dashboard');
});
