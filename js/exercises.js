let currentLesson = null;
let currentIndex = 0;
let selectedAnswer = null;
let orderSelection = [];

function startLesson(lessonId) {
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    console.warn('Lektion nicht gefunden:', lessonId);
    return;
  }

  currentLesson = lesson;
  currentIndex = 0;
  selectedAnswer = null;
  orderSelection = [];

  const titleEl = document.getElementById('lesson-title');
  const catEl = document.getElementById('lesson-category');
  const xpEl = document.getElementById('lesson-xp-label');

  if (titleEl) titleEl.textContent = lesson.title;
  if (catEl) catEl.textContent = (lesson.level || '') + ' · ' + (lesson.category || '');
  if (xpEl) xpEl.textContent = '+' + (lesson.xp || 50) + ' XP';

  showPage('lesson');
  loadExercise();
}

function loadExercise() {
  if (!currentLesson) return;

  const exercises = currentLesson.exercises || [];

  if (currentIndex >= exercises.length) {
    finishLesson();
    return;
  }

  const ex = exercises[currentIndex];

  selectedAnswer = null;
  orderSelection = [];

  const bar = document.getElementById('lesson-progress');

  if (bar) {
    bar.style.width = Math.round((currentIndex / exercises.length) * 100) + '%';
  }

  const feedback = document.getElementById('feedback');

  if (feedback) {
    feedback.className = 'feedback hidden';
    feedback.textContent = '';
  }

  const checkBtn = document.getElementById('btn-check');
  const nextBtn = document.getElementById('btn-next');

  if (checkBtn) checkBtn.classList.remove('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');

  const area = document.getElementById('exercise-area');

  if (!area) return;

  area.innerHTML = '';

  const q = document.createElement('div');

  q.className = 'exercise-question';
  q.textContent = ex.question || '';

  area.appendChild(q);

  if (
    ex.type === 'multiple-choice' ||
    ex.type === 'true-false' ||
    ex.type === 'situation'
  ) {
    renderChoices(area, ex);
  } else if (
    ex.type === 'fill-blank' ||
    ex.type === 'translate-pl-de' ||
    ex.type === 'translate-de-pl'
  ) {
    renderInput(area, ex);
  } else if (ex.type === 'order-sentence') {
    renderOrder(area, ex);
  } else {
    renderChoices(area, ex);
  }
}

function renderChoices(container, ex) {
  const wrap = document.createElement('div');

  wrap.className = 'choices';

  (ex.answers || []).forEach((ans, i) => {
    const btn = document.createElement('button');

    btn.className = 'choice-btn';
    btn.type = 'button';
    btn.textContent = ans;
    btn.dataset.index = i;

    btn.addEventListener('click', () => {
      wrap
        .querySelectorAll('.choice-btn')
        .forEach(b => b.classList.remove('selected'));

      btn.classList.add('selected');
      selectedAnswer = i;
    });

    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}

function renderInput(container, ex) {
  const wrap = document.createElement('div');

  wrap.className = 'input-wrap';

  const input = document.createElement('input');

  input.type = 'text';
  input.id = 'answer-input';
  input.placeholder = 'Antwort eingeben…';
  input.autocomplete = 'off';

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAnswer();
  });

  wrap.appendChild(input);
  container.appendChild(wrap);

  setTimeout(() => input.focus(), 50);
}

function renderOrder(container, ex) {
  const tokens = ex.tokens || [];
  const shuffled = [...tokens].sort(() => Math.random() - 0.5);

  const tokenWrap = document.createElement('div');

  tokenWrap.className = 'order-tokens';
  tokenWrap.id = 'order-tokens';

  shuffled.forEach((t, i) => {
    const span = document.createElement('span');

    span.className = 'token';
    span.textContent = t;
    span.dataset.token = t;
    span.dataset.idx = i;

    span.addEventListener('click', () => {
      if (span.classList.contains('used')) return;

      span.classList.add('used');
      orderSelection.push(t);
      updateOrderDrop();
    });

    tokenWrap.appendChild(span);
  });

  const drop = document.createElement('div');

  drop.className = 'order-drop';
  drop.id = 'order-drop';

  drop.addEventListener('click', () => {
    if (orderSelection.length === 0) return;

    const last = orderSelection.pop();

    tokenWrap
      .querySelectorAll('.token')
      .forEach(el => {
        if (el.dataset.token === last && el.classList.contains('used')) {
          el.classList.remove('used');
        }
      });

    updateOrderDrop();
  });

  container.appendChild(tokenWrap);
  container.appendChild(drop);
}

function updateOrderDrop() {
  const drop = document.getElementById('order-drop');

  if (!drop) return;

  drop.innerHTML = '';

  orderSelection.forEach(t => {
    const span = document.createElement('span');

    span.className = 'token';
    span.textContent = t;

    drop.appendChild(span);
  });
}

function normalizeAnswer(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[?.!]+$/, '');
}

function checkAnswer() {
  if (!currentLesson) return;

  const ex = currentLesson.exercises[currentIndex];

  if (!ex) return;

  let correct = false;

  if (
    ex.type === 'multiple-choice' ||
    ex.type === 'true-false' ||
    ex.type === 'situation'
  ) {
    if (selectedAnswer === null) return;

    correct = selectedAnswer === ex.correct;

    const btns = document.querySelectorAll('.choice-btn');

    btns.forEach((btn, i) => {
      if (i === ex.correct) {
        btn.classList.add('correct');
      } else if (i === selectedAnswer && !correct) {
        btn.classList.add('wrong');
      }

      btn.disabled = true;
    });
  } else if (
    ex.type === 'fill-blank' ||
    ex.type === 'translate-pl-de' ||
    ex.type === 'translate-de-pl'
  ) {
    const input = document.getElementById('answer-input');

    if (!input) return;

    const normalized = normalizeAnswer(input.value);
    const accepted = Array.isArray(ex.correct)
      ? ex.correct
      : [ex.correct];

    correct = accepted.some(
      a => normalizeAnswer(a) === normalized
    );

    input.disabled = true;
    input.style.borderColor = correct
      ? 'var(--ok)'
      : 'var(--bad)';
  } else if (ex.type === 'order-sentence') {
    const built = orderSelection.join(' ');

    correct =
      normalizeAnswer(built) === normalizeAnswer(ex.correct);
  }

  const feedback = document.getElementById('feedback');

  if (feedback) {
    feedback.classList.remove('hidden');

    if (correct) {
      feedback.className = 'feedback ok';
      feedback.textContent = 'Richtig! ' + (ex.explanation || '');
    } else {
      feedback.className = 'feedback bad';

      let msg = 'Nicht ganz. ';

      if (ex.hints && ex.hints.solution) {
        msg += 'Lösung: ' + ex.hints.solution;
      } else if (Array.isArray(ex.correct)) {
        msg += 'Richtig wäre z. B.: ' + ex.correct[0];
      } else if (typeof ex.correct === 'string') {
        msg += 'Richtig wäre: ' + ex.correct;
      } else if (ex.answers && typeof ex.correct === 'number') {
        msg += 'Richtig: ' + ex.answers[ex.correct];
      }

      if (ex.explanation) {
        msg += ' — ' + ex.explanation;
      }

      feedback.textContent = msg;
    }
  }

  const checkBtn = document.getElementById('btn-check');
  const nextBtn = document.getElementById('btn-next');

  if (checkBtn) checkBtn.classList.add('hidden');
  if (nextBtn) nextBtn.classList.remove('hidden');
}

function showHint() {
  if (!currentLesson) return;

  const ex = currentLesson.exercises[currentIndex];

  if (!ex || !ex.hints) return;

  const feedback = document.getElementById('feedback');

  if (!feedback) return;

  let text = '';

  if (ex.hints.german) {
    text += ex.hints.german;
  }

  if (ex.hints.polish) {
    text += (text ? ' / ' : '') + ex.hints.polish;
  }

  feedback.className = 'feedback';
  feedback.style.background = '#f0f0e8';
  feedback.style.color = 'var(--ink-soft)';
  feedback.style.border = '1px solid var(--border)';
  feedback.textContent = 'Hinweis: ' + text;
  feedback.classList.remove('hidden');
}

function nextExercise() {
  currentIndex++;
  loadExercise();
}

function finishLesson() {
  if (!currentLesson) return;

  const xp = currentLesson.xp || 50;

  window.appState = addXP(window.appState, xp);
  window.appState = markLessonComplete(
    window.appState,
    currentLesson.id
  );

  saveProgress(window.appState);

  const bar = document.getElementById('lesson-progress');

  if (bar) {
    bar.style.width = '100%';
  }

  const area = document.getElementById('exercise-area');

  if (area) {
    area.innerHTML =
      '<div class="exercise-question">Lektion geschafft!</div>' +
      '<p>Du hast <strong>+' + xp + ' XP</strong> bekommen.</p>';
  }

  const feedback = document.getElementById('feedback');

  if (feedback) {
    feedback.className = 'feedback ok';
    feedback.textContent = 'Weiter so!';
  }

  const checkBtn = document.getElementById('btn-check');
  const nextBtn = document.getElementById('btn-next');
  const hintBtn = document.getElementById('btn-hint');

  if (checkBtn) checkBtn.classList.add('hidden');
  if (hintBtn) hintBtn.classList.add('hidden');

  if (nextBtn) {
    nextBtn.textContent = 'Zurück zum Lernpfad';
    nextBtn.classList.remove('hidden');

    nextBtn.onclick = () => {
      nextBtn.textContent = 'Weiter';
      nextBtn.onclick = null;
      showPage('learn');
    };
  }
}
