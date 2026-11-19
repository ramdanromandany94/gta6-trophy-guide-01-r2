// Rendering: the tracker list, the guide detail pane, the roadmap stages
// and the missables page. Every trophy's guide and sources are shown here.
import { KIND_LABELS, isSpoilerHidden, spoilerMask } from './filters.js';

const $ = (id) => document.getElementById(id);
const medalLetter = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function renderTracker(state, visible) {
  const list = $('trophyList');
  list.replaceChildren();
  $('listSummary').textContent = `Showing ${visible.length} of ${state.trophies.length} trophies` +
    (state.kind !== 'all' ? ` · filter: ${state.kind}` : '');
  for (const t of visible) {
    const masked = spoilerMask(t, state);
    const li = el('li', 'trophy-row' + (state.earned.has(t.name) ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : ''));
    li.dataset.id = String(t.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${masked ? 'hidden story trophy' : t.name}`);
    li.append(box);
    li.append(el('span', `medal ${t.grade}`, medalLetter[t.grade]));
    const body = el('div');
    body.append(el('div', 'trophy-name', masked ? masked.name : t.name));
    body.append(el('div', 'trophy-desc', masked ? masked.description : t.description));
    const meta = el('div', 'trophy-meta');
    meta.append(el('span', `tag grade-${t.grade}`, t.grade));
    meta.append(el('span', 'tag', KIND_LABELS[t.kind] ?? t.kind));
    if (t.missable) meta.append(el('span', 'tag missable', 'Missable'));
    if (t.count) meta.append(el('span', 'tag', `Target: ${t.count.toLocaleString('en-US')}`));
    body.append(meta);
    li.append(body);
    li.append(el('span', 'trophy-count', state.earned.has(t.name) ? '✓ Earned' : ''));
    list.append(li);
  }
  if (!visible.length) {
    const li = el('li', 'trophy-row');
    li.append(el('div', 'trophy-desc', 'No trophies match these filters.'));
    list.append(li);
  }
}

export function renderDetail(state) {
  const pane = $('detailPane');
  const t = state.trophies.find((x) => x.id === state.selectedId);
  if (!t) {
    pane.replaceChildren(el('p', 'trophy-desc', 'Select a trophy to read its guide.'));
    return;
  }
  const masked = spoilerMask(t, state);
  pane.replaceChildren();
  pane.append(el('span', `medal ${t.grade}`, medalLetter[t.grade]));
  pane.append(el('h2', null, masked ? masked.name : t.name));
  pane.append(el('p', 'detail-desc', masked ? masked.description : t.description));
  const meta = el('div', 'trophy-meta');
  meta.append(el('span', `tag grade-${t.grade}`, t.grade));
  meta.append(el('span', 'tag', KIND_LABELS[t.kind] ?? t.kind));
  if (t.missable) meta.append(el('span', 'tag missable', 'Missable'));
  if (t.count) meta.append(el('span', 'tag', `Target: ${t.count.toLocaleString('en-US')}`));
  pane.append(meta);
  if (!masked) {
    const srcLine = el('p', 'source-line', 'Sources: ');
    (t.sources || []).forEach((s, i) => {
      if (i) srcLine.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      srcLine.append(a);
    });
    pane.append(srcLine);
    if (t.missable) {
      const warn = el('div', 'warn-box', '⚠ ' + t.missableNote);
      pane.append(el('h3', null, 'Missable?'));
      pane.append(warn);
    } else {
      pane.append(el('h3', null, 'Missable?'));
      pane.append(el('div', 'safe-box', t.missableNote));
    }
    pane.append(el('h3', null, 'Guide'));
    pane.append(el('p', null, t.guide));
  }
  const btn = el('button', 'earn-btn', state.earned.has(t.name) ? '✓ Earned — click to unmark' : 'Mark as earned');
  btn.id = 'detailEarnBtn';
  btn.type = 'button';
  pane.append(btn);
}

export function renderRoadmap(state) {
  const list = $('roadmapList');
  list.replaceChildren();
  for (const stage of state.roadmap) {
    const li = el('li', 'roadmap-stage');
    const h = el('h3');
    h.append(el('span', 'stage-num', `Stage ${stage.stage} — `));
    h.append(document.createTextNode(stage.title));
    li.append(h);
    li.append(el('p', null, stage.text));
    const chips = el('div', 'stage-trophies');
    for (const id of stage.trophyIds) {
      const t = state.trophies.find((x) => x.id === id);
      if (!t) continue;
      const chip = el('span', 'stage-trophy' + (state.earned.has(t.name) ? ' earned' : ''),
        `${t.missable ? '⚠ ' : ''}${isSpoilerHidden(t, state) ? 'Hidden story trophy' : t.name}`);
      chips.append(chip);
    }
    li.append(chips);
    const done = stage.trophyIds.filter((id) => {
      const t = state.trophies.find((x) => x.id === id);
      return t && state.earned.has(t.name);
    }).length;
    li.append(el('p', 'trophy-desc', `${done} of ${stage.trophyIds.length} earned in this stage`));
    list.append(li);
  }
}

export function renderMissables(state) {
  const box = $('missableList');
  box.replaceChildren();
  const missables = state.trophies.filter((t) => t.missable);
  for (const t of missables) {
    const card = el('div', 'missable-card');
    card.append(el('h3', null, `⚠ ${t.name} — ${t.grade}`));
    card.append(el('p', 'detail-desc', t.description));
    card.append(el('p', null, t.missableNote));
    card.append(el('p', null, t.guide));
    const src = el('p', 'trophy-desc', 'Sources: ');
    (t.sources || []).forEach((s, i) => {
      if (i) src.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      src.append(a);
    });
    card.append(src);
    box.append(card);
  }
  box.append(el('p', 'trophy-desc', `Total flagged missable: ${missables.length} of ${state.trophies.length} trophies. The other ${state.trophies.length - missables.length} stay earnable in free roam after the story.`));
}
