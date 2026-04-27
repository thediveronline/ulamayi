const STORAGE_KEY = 'ulamayi-profs-theme';
const THEMES = {
  light: 'light',
  dark: 'dark'
};

export const getStoredTheme = () => {
  try {
    const theme = window.localStorage.getItem(STORAGE_KEY);
    return theme === THEMES.dark ? THEMES.dark : THEMES.light;
  } catch {
    return THEMES.light;
  }
};

export const applyTheme = (theme) => {
  const resolvedTheme = theme === THEMES.dark ? THEMES.dark : THEMES.light;
  document.documentElement.dataset.theme = resolvedTheme;

  try {
    window.localStorage.setItem(STORAGE_KEY, resolvedTheme);
  } catch {
    // ignore storage failures
  }

  return resolvedTheme;
};

export const initializeTheme = () => applyTheme(getStoredTheme());

export const toggleTheme = () => {
  const nextTheme = getStoredTheme() === THEMES.dark ? THEMES.light : THEMES.dark;
  return applyTheme(nextTheme);
};

export const isDarkTheme = () => getStoredTheme() === THEMES.dark;
