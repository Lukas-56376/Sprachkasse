function showPage(pageId){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
const page=document.getElementById('page-'+pageId);
if(page)page.classList.add('active');
document.querySelectorAll('.nav-item,.bottom-nav-item').forEach(btn=>{
const active=btn.dataset.page===pageId;
btn.classList.toggle('active',active);
if(active)btn.setAttribute('aria-current','page');
else btn.removeAttribute('aria-current');
});
if(pageId==='dashboard')updateDashboard();
if(pageId==='learn')renderLearningPath();
if(pageId==='dictionary')renderDictionary();
if(pageId==='stats')updateStats();
if(pageId==='profile')updateProfile();
window.scrollTo(0,0);
}
function updateDashboard(){
const state=window.appState||loadProgress();
const levelEl=document.getElementById('dash-level');
const xpEl=document.getElementById('dash-xp');
const streakEl=document.getElementById('dash-streak');
if(levelEl)levelEl.textContent=getCurrentLevel(state);
if(xpEl)xpEl.textContent=state.xp||0;
if(streakEl)streakEl.textContent=(state.streak||0)+' Tage';
const sideStreak=document.getElementById('sidebar-streak-num');
if(sideStreak)sideStreak.textContent=state.streak||0;
const dailyXP=state.dailyXP||0;
const goal=state.dailyGoal||50;
const pct=Math.min(100,Math.round((dailyXP/goal)*100));
const bar=document.getElementById('dash-daily-bar');
const txt=document.getElementById('dash-daily-text');
if(bar)bar.style.width=pct+'%';
if(txt)txt.textContent=dailyXP>=goal?'Tagesziel erreicht! 🎉':dailyXP+' / '+goal+' XP';
const nextId=state.currentLessonId||1;
const lesson=getLessonById(nextId);
const titleEl=document.getElementById('dash-next-title');
const metaEl=document.getElementById('dash-next-level');
if(lesson&&titleEl){
titleEl.textContent=String(lesson.id).padStart(2,'0')+' – '+lesson.title;
if(metaEl)metaEl.textContent=lesson.level+' · '+(lesson.category||'');
}else if(titleEl){
titleEl.textContent='Alle Lektionen abgeschlossen!';
if(metaEl)metaEl.textContent='Herzlichen Glückwunsch';
}
const h1=document.getElementById('dashboard-title');
if(h1)h1.textContent=state.name?'Willkommen zurück, '+state.name+'!':'Willkommen zurück!';
}
function getCurrentLevel(state){
const done=(state.completedLessons||[]).length;
if(done>=75)return 'B1';
if(done>=40)return 'A2+';
return 'A2';
}
function renderLearningPath(){
const container=document.getElementById('learning-path');
if(!container)return;
const state=window.appState||loadProgress();
const all=getAllLessons();
const completed=new Set(state.completedLessons||[]);
const current=state.currentLessonId||1;
container.innerHTML='';
all.forEach(lesson=>{
const item=document.createElement('div');
item.className='lesson-item';
if(completed.has(lesson.id))item.classList.add('done');
if(lesson.id===current)item.classList.add('current');
const num=document.createElement('span');
num.className='lesson-num';
num.textContent=String(lesson.id).padStart(2,'0');
const info=document.createElement('div');
info.className='lesson-info';
info.innerHTML='<strong>'+escapeHtml(lesson.title)+'</strong><span>'+escapeHtml(lesson.level)+' · '+escapeHtml(lesson.category||'')+'</span>';
item.appendChild(num);
item.appendChild(info);
if(completed.has(lesson.id)){
const check=document.createElement('span');
check.className='lesson-check';
check.textContent='✓';
item.appendChild(check);
}
item.addEventListener('click',()=>startLesson(lesson.id));
container.appendChild(item);
});
}
function renderDictionary(filter){
const list=document.getElementById('dict-list');
if(!list||typeof DICTIONARY==='undefined')return;
const q=(filter||'').trim().toLowerCase();
list.innerHTML='';
const items=!q?DICTIONARY:DICTIONARY.filter(w=>w.de.toLowerCase().includes(q)||w.pl.toLowerCase().includes(q)||(w.example&&w.example.toLowerCase().includes(q)));
if(items.length===0){
list.innerHTML='<p class="small-note">Nichts gefunden.</p>';
return;
}
items.forEach(w=>{
const el=document.createElement('div');
el.className='dict-item';
el.innerHTML='<div class="de">'+escapeHtml(w.de)+'</div><div class="pl">'+escapeHtml(w.pl)+'</div>'+(w.example?'<div class="ex">'+escapeHtml(w.example)+'</div>':'');
list.appendChild(el);
});
}
function updateStats(){
const grid=document.getElementById('stats-grid');
if(!grid)return;
const state=window.appState||loadProgress();
const done=(state.completedLessons||[]).length;
const total=100;
const pct=Math.round((done/total)*100);
grid.innerHTML='<div class="stat-card"><span class="stat-label">Lektionen</span><span class="stat-value">'+done+' / '+total+'</span></div><div class="stat-card"><span class="stat-label">Fortschritt</span><span class="stat-value">'+pct+'%</span></div><div class="stat-card"><span class="stat-label">XP</span><span class="stat-value">'+(state.xp||0)+'</span></div><div class="stat-card"><span class="stat-label">Serie</span><span class="stat-value">'+(state.streak||0)+' Tage</span></div><div class="stat-card"><span class="stat-label">Wörter</span><span class="stat-value">'+(state.learnedWords||[]).length+'</span></div><div class="stat-card"><span class="stat-label">Level</span><span class="stat-value">'+getCurrentLevel(state)+'</span></div>';
}
function updateProfile(){
const state=window.appState||loadProgress();
const input=document.getElementById('profile-name');
if(input)input.value=state.name||'';
}
function escapeHtml(str){
if(!str)return '';
return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getAllLessons(){
const chunks=[];
if(typeof LESSONS_01_10!=='undefined')chunks.push(...LESSONS_01_10);
if(typeof LESSONS_11_25!=='undefined')chunks.push(...LESSONS_11_25);
if(typeof LESSONS_26_50!=='undefined')chunks.push(...LESSONS_26_50);
if(typeof LESSONS_51_75!=='undefined')chunks.push(...LESSONS_51_75);
if(typeof LESSONS_76_100!=='undefined')chunks.push(...LESSONS_76_100);
return chunks;
}
function getLessonById(id){
return getAllLessons().find(l=>l.id===id)||null;
}
