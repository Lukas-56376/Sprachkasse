HEAD
document.addEventListener('DOMContentLoaded',()=>{
window.appState=loadProgress();
window.appState=resetDailyIfNeeded(window.appState);
saveProgress(window.appState);
document.querySelectorAll('[data-page]').forEach(btn=>{
btn.addEventListener('click',()=>{
const page=btn.dataset.page;
if(page)showPage(page);
});
});
const continueBtn=document.getElementById('btn-continue');
if(continueBtn){
continueBtn.addEventListener('click',()=>{
const id=(window.appState&&window.appState.currentLessonId)||1;
startLesson(id);
});
}
const backBtn=document.getElementById('btn-lesson-back');
if(backBtn)backBtn.addEventListener('click',()=>showPage('learn'));
const checkBtn=document.getElementById('btn-check');
if(checkBtn)checkBtn.addEventListener('click',()=>checkAnswer());
const nextBtn=document.getElementById('btn-next');
if(nextBtn)nextBtn.addEventListener('click',()=>nextExercise());
const hintBtn=document.getElementById('btn-hint');
if(hintBtn)hintBtn.addEventListener('click',()=>showHint());
const saveNameBtn=document.getElementById('btn-save-name');
if(saveNameBtn){
saveNameBtn.addEventListener('click',()=>{
const input=document.getElementById('profile-name');
if(!input)return;
const name=input.value.trim();
window.appState.name=name;
saveProgress(window.appState);
updateDashboard();
saveNameBtn.textContent='Gespeichert ✓';
setTimeout(()=>{saveNameBtn.textContent='Speichern'},1500);
});
}
const searchInput=document.getElementById('dict-search');
if(searchInput){
searchInput.addEventListener('input',()=>{
renderDictionary(searchInput.value);
});
}
showPage('dashboard');
});
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

