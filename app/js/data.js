// Loading the guide's data: the 55 trophies and the six roadmap stages.
// Both files live under app/data/ and are fetched from the app's own server.
export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('trophies.json did not load');
  return res.json();
}

export async function loadRoadmap() {
  const res = await fetch('data/roadmap.json');
  if (!res.ok) throw new Error('roadmap.json did not load');
  return res.json();
}
