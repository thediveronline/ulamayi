export const getSession = () => {
  const raw = localStorage.getItem('ulamayi-admin-session');
  return raw ? JSON.parse(raw) : null;
};

export const saveSession = (session) => {
  localStorage.setItem('ulamayi-admin-session', JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem('ulamayi-admin-session');
};

export const getUserRole = () => {
  const session = getSession();
  return session?.utilisateur?.role || null;
};

export const isAuthenticated = () => {
  return !!getSession()?.token;
};
