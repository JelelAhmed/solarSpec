/**
 * SolarSpec Storage Service
 * All AsyncStorage access is gated through this file.
 * Never import AsyncStorage directly from screens or components.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROPOSALS: '@solarspec_proposals',
  SETTINGS: '@solarspec_settings',
};

// ─── PROPOSALS ───────────────────────────────────────────────────────────────

/**
 * Loads all stored proposals (up to the last 10).
 * @returns {Promise<Array>} Array of proposal objects, newest first.
 */
export async function loadProposals() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROPOSALS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('loadProposals error:', e);
    return [];
  }
}

/**
 * Saves a new proposal to storage, capped at the last 10.
 * New proposals are prepended (index 0 = newest).
 * @param {object} proposal - Full proposal data object
 * @returns {Promise<void>}
 */
export async function saveProposal(proposal) {
  try {
    const existing = await loadProposals();
    const updated = [proposal, ...existing].slice(0, 10);
    await AsyncStorage.setItem(KEYS.PROPOSALS, JSON.stringify(updated));
  } catch (e) {
    console.error('saveProposal error:', e);
  }
}

/**
 * Deletes all stored proposals.
 * @returns {Promise<void>}
 */
export async function clearProposals() {
  try {
    await AsyncStorage.removeItem(KEYS.PROPOSALS);
  } catch (e) {
    console.error('clearProposals error:', e);
  }
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

/**
 * Loads user settings. Returns defaults if nothing saved yet.
 * @returns {Promise<object>} Settings object
 */
export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw
      ? JSON.parse(raw)
      : {
          businessName: '',
          technicianName: '',
          logoUri: null,
          defaultBatteryChemistry: 'lithium',
          defaultSystemVoltage: 48,
          defaultInverterType: 'hybrid',
          peakSunHours: 5,
        };
  } catch (e) {
    console.error('loadSettings error:', e);
    return {};
  }
}

/**
 * Saves (merges) updated settings to storage.
 * @param {object} updates - Partial settings object to merge
 * @returns {Promise<void>}
 */
export async function saveSettings(updates) {
  try {
    const current = await loadSettings();
    const merged = { ...current, ...updates };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
  } catch (e) {
    console.error('saveSettings error:', e);
  }
}
