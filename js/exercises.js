let currentLesson = null;
let currentExerciseIndex = 0;
let selectedAnswer = null;
let orderTokens = [];
let orderAnswer = [];
let isChecked = false;

function getAllLessons() {
  const parts = [
    typeof LESSONS_01_10 !== 'undefined' ? LESSONS_01_10 : [],
    typeof LESSONS_11_25 !== 'undefined' ? LESSONS_11_25 : [],
    typeof LESSONS_26_50 !== 'undefined' ? LESSONS_26_50 : [],
    typeof LESSONS_51_75 !== 'undefined' ? LESSONS_51_75 : [],
    typeof LESSONS_76_100 !== 'undefined' ? LESSONS_76_100 : []
  ];
  return parts.flat();
}

function getLessonById(id) {
  return getAllLessons().find(l => l.id === id) || null;
}

function startLesson(id) {
  currentLesson = getLessonById(id);
  if (!currentLesson) {
    console.error('Lesson not found:', id);
    return false;
  }
  currentExerciseIndex = 0;
  selectedAnswer = null;
  isChecked = false;
  orderTokens = [];
  orderAnswer = [];
  loadExercise();
  return true;
}

function loadExercise() {
  if (!currentLesson) return;
  const exercises = currentLesson.exercises;
  if (currentExerciseIndex >= exercises.length) {
    completeLesson();
    return;
  }

  const ex = exercises[currentExerciseIndex];
  selectedAnswer = null;
  isChecked = false;
  orderTokens = [];
  orderAnswer = [];

 
  const total = exercises.length;
  const current = currentExerciseIndex + 1;
  const pct = Math.round((currentExerciseIndex / total) * 100);
  document.getElementById('lesson-progress-bar').style.width = pct + '%';
  document.getElementById('lesson-progress-text').textContent = current + ' / ' + total;


  document.getElementById('exercise-question').textContent = ex.question;

  resetHints(ex);

 
  const feedback = document.getElementById('feedback');
  feedback.hidden = true;
  feedback.className = 'feedback';
  feedback.innerHTML = '';

  document.getElementById('btn-check').hidden = false;
  document.getElementById('btn-check').disabled = true;
  document.getElementById('btn-next').hidden = true;

  
  const area = document.getElementById('exercise-area');
  area.innerHTML = '';

  switch (ex.type) {
    case 'multiple-choice':
    case 'single-choice':
    case 'situation':
    case 'dialog-complete':
      renderChoices(area, ex);
      break;
    case 'true-false':
      renderTrueFalse(area, ex);
      break;
    case 'fill-blank':
    case 'translate-pl-de':
    case 'translate-de-pl':
    case 'correct-error':
      renderInput(area, ex);
      break;
    case 'order-sentence':
      renderOrder(area, ex);
      break;
    case 'match':
      renderChoices(area, ex); // vereinfacht als Choice
      break;
    default:
      renderChoices(area, ex);
  }
}

function renderChoices(container, ex) {
  const list = document.createElement('div');
  list.className = 'choice-list';
  list.setAttribute('role', 'radiogroup');

  (ex.answers || []).forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = ans;
    btn.dataset.index = i;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.addEventListener('click', () => {
      if (isChecked) return;
      list.querySelectorAll('.choice-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      selectedAnswer = i;
      document.getElementById('btn-check').disabled = false;
    });
    list.appendChild(btn);
  });
  container.appendChild(list);
}

function renderTrueFalse(container, ex) {
  const answers = ex.answers || ['Richtig', 'Falsch'];
  const list = document.createElement('div');
  list.className = 'choice-list';
  answers.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = ans;
    btn.dataset.index = i;
    btn.addEventListener('click', () => {
      if (isChecked) return;
      list.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAnswer = i;
      document.getElementById('btn-check').disabled = false;
    });
    list.appendChild(btn);
  });
  container.appendChild(list);
}

function renderInput(container, ex) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'exercise-input';
  input.id = 'exercise-text-input';
  input.placeholder = 'Antwort eingeben…';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.addEventListener('input', () => {
    if (isChecked) return;
    const val = input.value.trim();
    document.getElementById('btn-check').disabled = val.length === 0;
    selectedAnswer = val;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('btn-check').disabled) {
      checkAnswer();
    }
  });
  container.appendChild(input);
  setTimeout(() => input.focus(), 50);
}

function renderOrder(container, ex) {
  const tokens = (ex.tokens || (typeof ex.correct === 'string' ? ex.correct.split(' ') : [])).slice();
  // Shuffle
  for (let i = tokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }
  orderTokens = tokens.map((t, i) => ({ text: t, id: i }));
  orderAnswer = [];

  const answerBox = document.createElement('div');
  answerBox.className = 'order-answer';
  answerBox.id = 'order-answer-box';
  answerBox.setAttribute('aria-label', 'Ihre Antwort');
  container.appendChild(answerBox);

  const tokenBox = document.createElement('div');
  tokenBox.className = 'order-tokens';
  tokenBox.id = 'order-token-box';
  orderTokens.forEach(tok => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'order-token';
    el.textContent = tok.text;
    el.dataset.id = tok.id;
    el.addEventListener('click', () => {
      if (isChecked) return;
      if (el.classList.contains('used')) return;
      el.classList.add('used');
      orderAnswer.push(tok);
      renderOrderAnswer();
      document.getElementById('btn-check').disabled = orderAnswer.length === 0;
    });
    tokenBox.appendChild(el);
  });
  container.appendChild(tokenBox);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn-ghost';
  clearBtn.textContent = 'Zurücksetzen';
  clearBtn.style.marginTop = '8px';
  clearBtn.addEventListener('click', () => {
    if (isChecked) return;
    orderAnswer = [];
    document.querySelectorAll('.order-token').forEach(el => el.classList.remove('used'));
    renderOrderAnswer();
    document.getElementById('btn-check').disabled = true;
  });
  container.appendChild(clearBtn);
}

function renderOrderAnswer() {
  const box = document.getElementById('order-answer-box');
  if (!box) return;
  box.innerHTML = '';
  orderAnswer.forEach((tok, idx) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'order-token';
    el.textContent = tok.text;
    el.addEventListener('click', () => {
      if (isChecked) return;
      orderAnswer.splice(idx, 1);
      const tokenEl = document.querySelector('.order-token[data-id="' + tok.id + '"]');
      if (tokenEl) tokenEl.classList.remove('used');
      renderOrderAnswer();
      document.getElementById('btn-check').disabled = orderAnswer.length === 0;
    });
    box.appendChild(el);
  });
}

function resetHints(ex) {
  const hints = ex.hints || {};
  ['german', 'polish', 'solution'].forEach(type => {
    const content = document.getElementById('hint-' + type);
    const btn = document.querySelector('.hint-btn[data-hint="' + type + '"]');
    if (content) {
      content.textContent = hints[type] || '';
      content.hidden = true;
    }
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function showHint(type) {
  const content = document.getElementById('hint-' + type);
  const btn = document.querySelector('.hint-btn[data-hint="' + type + '"]');
  if (!content || !btn) return;
  const isOpen = !content.hidden;
  content.hidden = isOpen;
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function normalizeAnswer(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:„""]/g, '')
    .replace(/\s+/g, ' ');
}

function checkAnswer() {
  if (!currentLesson || isChecked) return;
  const ex = currentLesson.exercises[currentExerciseIndex];
  let isCorrect = false;
  let userDisplay = '';

  if (ex.type === 'order-sentence') {
    const userStr = orderAnswer.map(t => t.text).join(' ');
    const correctStr = typeof ex.correct === 'string' ? ex.correct : (ex.correct || []).join(' ');
    isCorrect = normalizeAnswer(userStr) === normalizeAnswer(correctStr);
    userDisplay = userStr;
  } else if (['fill-blank', 'translate-pl-de', 'translate-de-pl', 'correct-error'].includes(ex.type)) {
    const input = document.getElementById('exercise-text-input');
    const val = (selectedAnswer || (input ? input.value : '')).trim();
    userDisplay = val;
    const correct = ex.correct;
    if (Array.isArray(correct)) {
      isCorrect = correct.some(c => normalizeAnswer(c) === normalizeAnswer(val));
    } else {
      isCorrect = normalizeAnswer(correct) === normalizeAnswer(val);
    }
    if (input) {
      input.classList.add(isCorrect ? 'correct' : 'wrong');
      input.disabled = true;
    }
  } else {
    const correctIndex = typeof ex.correct === 'number' ? ex.correct : 0;
    isCorrect = selectedAnswer === correctIndex;
    userDisplay = (ex.answers || [])[selectedAnswer] || '';

    // Mark buttons
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correctIndex) btn.classList.add('correct');
      if (i === selectedAnswer && !isCorrect) btn.classList.add('wrong');
    });
  }

  isChecked = true;
  document.getElementById('btn-check').hidden = true;

  const feedback = document.getElementById('feedback');
  feedback.hidden = false;

  if (isCorrect) {
    feedback.className = 'feedback correct';
    const xpGain = ex.xp || 10;
    feedback.innerHTML = '<strong>Richtig!</strong> ' + (ex.explanation || '') +
      '<span class="feedback-xp">+' + xpGain + ' XP</span>';

    if (typeof window.onCorrectAnswer === 'function') {
      window.onCorrectAnswer(xpGain);
    }
    document.getElementById('btn-next').hidden = false;
  } else {
    feedback.className = 'feedback wrong';
    let correctText = '';
    if (typeof ex.correct === 'number') {
      correctText = (ex.answers || [])[ex.correct] || '';
    } else if (Array.isArray(ex.correct)) {
      correctText = ex.correct[0] || '';
    } else {
      correctText = ex.correct || '';
    }
    feedback.innerHTML = '<strong>Leider falsch.</strong> ' +
      (ex.explanation || 'Die richtige Antwort lautet: „' + correctText + '“.') +
      '<br><em>Sie können es erneut versuchen.</em>';


    document.getElementById('btn-next').hidden = true;
    setTimeout(() => {
      // Nach kurzer Zeit erneut versuchen lassen
      isChecked = false;
      selectedAnswer = null;
      orderAnswer = [];
      orderTokens = [];
      document.getElementById('btn-check').hidden = false;
      document.getElementById('btn-check').disabled = true;
      loadExercise();
    }, 2200);
  }
}

function nextExercise() {
  if (!currentLesson) return;
  currentExerciseIndex++;
  if (currentExerciseIndex >= currentLesson.exercises.length) {
    completeLesson();
  } else {
    loadExercise();
  }
}

function completeLesson() {
  if (!currentLesson) return;
  const lessonId = currentLesson.id;
  const bonusXP = currentLesson.xp || 50;

  if (typeof window.onLessonComplete === 'function') {
    window.onLessonComplete(lessonId, bonusXP);
  }

  // Zurück zum Lernpfad
  if (typeof window.showPage === 'function') {
    window.showPage('learn');
  }
}
