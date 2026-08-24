document.addEventListener('DOMContentLoaded', () => {
  window.appState = loadProgress();
  window.appState = resetDailyIfNeeded(window.appState);

  saveProgress(window.appState);

  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;

      if (page) {
        showPage(page);
      }
    });
  });

  const continueBtn = document.getElementById('btn-continue');

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const id =
        (window.appState && window.appState.currentLessonId) || 1;

      startLesson(id);
    });
  }

  const backBtn = document.getElementById('btn-lesson-back');

  if (backBtn) {
    backBtn.addEventListener('click', () => showPage('learn'));
  }

  const checkBtn = document.getElementById('btn-check');

  if (checkBtn) {
    checkBtn.addEventListener('click', () => checkAnswer());
  }

  const nextBtn = document.getElementById('btn-next');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => nextExercise());
  }

  const hintBtn = document.getElementById('btn-hint');

  if (hintBtn) {
    hintBtn.addEventListener('click', () => showHint());
  }

  const saveNameBtn = document.getElementById('btn-save-name');

  if (saveNameBtn) {
    saveNameBtn.addEventListener('click', () => {
      const input = document.getElementById('profile-name');

      if (!input) return;

      const name = input.value.trim();

      window.appState.name = name;
      saveProgress(window.appState);
      updateDashboard();

      saveNameBtn.textContent = 'Gespeichert ✓';

      setTimeout(() => {
        saveNameBtn.textContent = 'Speichern';
      }, 1500);
    });
  }

  const searchInput = document.getElementById('dict-search');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderDictionary(searchInput.value);
    });
  }

  showPage('dashboard');
});
