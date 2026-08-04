const THEME_KEY = 'ulamayi-admin-theme';

export const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'light';
};

export const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
};

export const initTheme = () => {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
};
