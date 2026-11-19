// Boot and wiring for Leonida Legend: loads the trophy data, renders the
// tracker, roadmap and missables views, and wires every control on the page.
import { loadTrophies, loadRoadmap } from './data.js';
import { loadProgress, loadSettings, saveProgress, saveSettings } from './store.js';
import { applyFilters, spoilerMask } from './filters.js';
import { renderTracker, renderDetail, renderRoadmap, renderMissables } from './views.js';

const state = {
  trophies: [],
  roadmap: [],
  earned: loadProgress(),
  settings: loadSettings(),
  selectedId: null,
  kind: 'all',
  grade: 'all',
  query: '',
};

const $ = (id) => document.getElementById(id);

function refresh() {
  const visible = applyFilters(state.trophies, state);
  renderTracker(state, visible);
  renderDetail(state);
  renderRoadmap(state);
  renderMissables(state);
  updateProgress();
}

function updateProgress() {
  const total = state.trophies.length;
  const earned = state.trophies.filter((t) => state.earned.has(t.name)).length;
  $('progressText').textContent = `${earned} of ${total} earned`;
  $('progressFill').style.width = total ? `${Math.round((earned / total) * 100)}%` : '0%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const got = state.trophies.filter((t) => t.grade === g && state.earned.has(t.name)).length;
    const all = state.trophies.filter((t) => t.grade === g).length;
    return `${got}/${all} ${g}`;
  });
  $('gradeCounts').textContent = counts.join(' · ');
}

function toggleEarned(name) {
  if (state.earned.has(name)) state.earned.delete(name);
  else state.earned.add(name);
  saveProgress(state.earned);
  refresh();
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  for (const name of ['tracker', 'roadmap', 'missables', 'about']) {
    $('view' + name[0].toUpperCase() + name.slice(1)).classList.toggle('hidden', name !== tab);
  }
}

async function boot() {
  const doc = await loadTrophies();
  state.trophies = doc.trophies;
  state.roadmap = await loadRoadmap();
  if (!state.selectedId && state.trophies.length) state.selectedId = state.trophies[0].id;

  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('#kindChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
      refresh();
    });
  });
  $('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; refresh(); });
  $('search').addEventListener('input', (e) => { state.query = e.target.value; refresh(); });
  $('spoilerToggle').checked = state.settings.hideSpoilers;
  $('spoilerToggle').addEventListener('change', (e) => {
    state.settings.hideSpoilers = e.target.checked;
    saveSettings(state.settings);
    refresh();
  });
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...state.earned].sort() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const names = Array.isArray(data) ? data : data.earned;
      const known = new Set(state.trophies.map((t) => t.name));
      state.earned = new Set((names || []).filter((n) => known.has(n)));
      saveProgress(state.earned);
      refresh();
    } catch {
      alert('That file is not a valid progress export.');
    }
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      state.earned = new Set();
      saveProgress(state.earned);
      refresh();
    }
  });
  $('trophyList').addEventListener('click', (e) => {
    const row = e.target.closest('.trophy-row');
    if (!row) return;
    const id = Number(row.dataset.id);
    if (e.target.matches('input[type="checkbox"]')) {
      toggleEarned(state.trophies.find((t) => t.id === id).name);
    } else {
      state.selectedId = id;
      renderTracker(state, applyFilters(state.trophies, state));
      renderDetail(state);
    }
  });
  $('detailPane').addEventListener('click', (e) => {
    if (e.target.id === 'detailEarnBtn') {
      const t = state.trophies.find((x) => x.id === state.selectedId);
      if (t) toggleEarned(t.name);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') state.selectedId = null;
  });
  refresh();
}

boot();
export { spoilerMask };
