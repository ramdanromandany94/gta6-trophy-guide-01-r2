// Filtering and the spoiler rule: which trophies the list shows, and which
// story trophies stay hidden until they are earned.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Strangers',
  collectible: 'Collectible',
  activity: 'Activity',
  world: 'Open world',
  completion: 'Completion',
};

export function isSpoilerHidden(trophy, state) {
  return state.settings.hideSpoilers && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

export function spoilerMask(trophy, state) {
  if (!isSpoilerHidden(trophy, state)) return null;
  return { name: 'Hidden story trophy', description: 'Earn this trophy to reveal its name and description.' };
}

export function applyFilters(trophies, state) {
  const q = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'unearned' && state.earned.has(t.name)) return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && state.kind !== 'unearned' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
