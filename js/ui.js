function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(btn => {
    const isActive = btn.dataset.page === pageId;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  if (pageId === 'dashboard') updateDashboard();
  if (pageId === 'learn') renderLearningPath();
  if (pageId === 'dictionary') renderDictionary();
  if (pageId === 'stats') updateStats();
  if (pageId === 'profile') updateProfile();

  window.scrollTo(0, 0);
}

function updateDashboard() {
  const state = window.appState || loadProgress();
  document.getElementById('dash-level').textContent = getCurrentLevel(state);
  document.getElementById('dash-xp').textContent = state.xp || 0;
  document.getElementById('dash-streak').textContent = (state.streak || 0) + ' Tage';

  const dailyXP = state.dailyXP || 0;
  const goal = state.dailyGoal || 50;
  const pct = Math.min(100, Math.round((dailyXP / goal) * 100));
  document.getElementById('dash-daily-bar').style.width = pct + '%';
  document.getElementById('dash-daily-text').textContent =
    dailyXP >= goal ? 'Tagesziel erreicht! 🎉' : dailyXP + ' / ' + goal + ' XP';


   const nextId = state.currentLessonId || 1;
   const lesson = getLessonById(nextId);
   if (lesson) {
    document.getElementById('dash-next-title').textContent =
      String(lesson.id).padStart(2, '0') + ' – ' + lesson.title;
    document.getElementById('dash-next-level').textContent =
      lesson.level + ' · ' + (lesson.category || '');
  } else {
    document.getElementById('dash-next-title').textContent = 'Alle Lektionen abgeschlossen!';
    document.getElementById('dash-next-level').textContent = 'Herzlichen Glückwunsch';
  }


  const title = document.getElementById('dashboard-title');
  if (state.name) {
    title.textContent = 'Willkommen zurück, ' + state.name + '!';
  } else {
    title.textContent = 'Willkommen zurück!';
  }
}

function getCurrentLevel(state) {
  const completed = (state.completedLessons || []).length;
  if (completed >= 75) return 'B1';
  if (completed >= 40) return 'A2+';
  return 'A2';
}

function renderLearningPath() {
  const container = document.getElementById('learning-path');
  if (!container) return;
  const lessons = getAllLessons();
  const state = window.appState || loadProgress();
  const completed = new Set(state.completedLessons || []);
  const currentId = state.currentLessonId || 1;

  container.innerHTML = '';

  lessons.forEach(lesson => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'path-item';
    btn.setAttribute('role', 'listitem');

    const isCompleted = completed.has(lesson.id);
    const isCurrent = lesson.id === currentId;

    if (isCompleted) btn.classList.add('completed');
    if (isCurrent) btn.classList.add('current');

    btn.innerHTML =
      '<span class="path-number">' + (isCompleted ? '✓' : String(lesson.id).padStart(2, '0')) + '</span>' +
      '<span class="path-info">' +
        '<span class="path-title">' + lesson.title + '</span>' +
        '<span class="path-meta">' + lesson.level + ' · ' + (lesson.category || '') + '</span>' +
      '</span>';

    btn.addEventListener('click', () => {
      startLessonView(lesson.id);
    });

    container.appendChild(btn);
  });
}

function startLessonView(id) {
  if (startLesson(id)) {
    showPage('lesson');
  }
}

function updateStats() {
  const state = window.appState || loadProgress();
  document.getElementById('stats-xp').textContent = state.xp || 0;
  document.getElementById('stats-lessons').textContent = (state.completedLessons || []).length;
  document.getElementById('stats-words').textContent = (state.learnedWords || []).length;
  document.getElementById('stats-level').textContent = getCurrentLevel(state);
  document.getElementById('stats-streak').textContent = (state.streak || 0) + ' Tage';
  const dailyXP = state.dailyXP || 0;
  const goal = state.dailyGoal || 50;
  document.getElementById('stats-daily').textContent = dailyXP + ' / ' + goal + ' XP';
}

function updateProfile() {
  const state = window.appState || loadProgress();
  const nameInput = document.getElementById('profile-name');
  if (nameInput && document.activeElement !== nameInput) {
    nameInput.value = state.name || '';
  }
  document.getElementById('profile-level').textContent = getCurrentLevel(state);
  document.getElementById('profile-xp').textContent = state.xp || 0;
  document.getElementById('profile-streak').textContent = (state.streak || 0) + ' Tage';
  document.getElementById('profile-lessons').textContent = (state.completedLessons || []).length;
}

function renderDictionary(filter) {
  const container = document.getElementById('dict-list');
  if (!container) return;
  const words = typeof DICTIONARY !== 'undefined' ? DICTIONARY : [];
  const q = (filter || '').trim().toLowerCase();

  const filtered = q
    ? words.filter(w =>
        w.de.toLowerCase().includes(q) ||
        w.pl.toLowerCase().includes(q)
      )
    : words;

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);padding:16px 0;">Keine Einträge gefunden.</p>';
    return;
  }

  filtered.forEach(w => {
    const item = document.createElement('div');
    item.className = 'dict-item';
    item.setAttribute('role', 'listitem');
    item.innerHTML =
      '<div class="dict-de">' + escapeHtml(w.de) + '</div>' +
      '<div class="dict-pl">' + escapeHtml(w.pl) + '</div>' +
      (w.example ? '<div class="dict-example">„' + escapeHtml(w.example) + '“</div>' : '');
    container.appendChild(item);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
