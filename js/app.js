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

document.querySelectorAll("[data-page]").forEach(function (button) {
  button.addEventListener("click", function () {
    const page = button.dataset.page;

    if (page) {
      showPage(page);
    }
  });
});

document.getElementById("btn-continue")?.addEventListener("click", function () {
  const lessonId = window.appState.currentLessonId || 1;
  startLessonView(lessonId);
});

document.getElementById("btn-back-lesson")?.addEventListener("click", function () {
  showPage("learn");
});

document.getElementById("btn-check")?.addEventListener("click", function () {
  checkAnswer();
});

document.getElementById("btn-next")?.addEventListener("click", function () {
  nextExercise();
});

document.querySelectorAll(".hint-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    const type = button.dataset.hint;

    if (type) {
      showHint(type);
    }
  });
});

document.getElementById("dict-search")?.addEventListener("input", function (event) {
  renderDictionary(event.target.value);
});

document.getElementById("btn-save-name")?.addEventListener("click", function () {
  const input = document.getElementById("profile-name");
  const name = (input?.value || "").trim().slice(0, 40);

  window.appState.name = name;
  saveProgress(window.appState);

  updateProfile();
  updateDashboard();

  const button = document.getElementById("btn-save-name");
  const oldText = button.textContent;

  button.textContent = "Gespeichert";

  setTimeout(function () {
    button.textContent = oldText;
  }, 1500);
});

document.addEventListener("DOMContentLoaded", function () {
  window.appState = loadProgress();
  window.appState = resetDailyIfNeeded(window.appState);

  saveProgress(window.appState);
  showPage("dashboard");
});