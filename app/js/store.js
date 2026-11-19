// Saved progress and settings: kept in this browser only (localStorage),
// exported as a JSON file and imported back. Nothing leaves the browser.
const PROGRESS_KEY = 'leonida-legend-progress-v1';
const SETTINGS_KEY = 'leonida-legend-settings-v1';

export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  try {
    return { hideSpoilers: false, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { hideSpoilers: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
