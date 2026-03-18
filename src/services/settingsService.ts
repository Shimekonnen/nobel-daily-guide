// Settings Service - Manages app settings with localStorage persistence

const SETTINGS_KEY = 'nobel-daily-guide-settings';

export interface AppSettings {
  showLearningHints: boolean;
  // Add more settings here as needed
}

const DEFAULT_SETTINGS: AppSettings = {
  showLearningHints: true, // Default ON as requested
};

// Get all settings
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new settings added in updates
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Get a specific setting
export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  const settings = getSettings();
  return settings[key];
}

// Update a specific setting
export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  try {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving setting:', error);
  }
}

// Update multiple settings at once
export function updateSettings(updates: Partial<AppSettings>): void {
  try {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Reset all settings to defaults
export function resetSettings(): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}
