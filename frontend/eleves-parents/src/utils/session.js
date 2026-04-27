const SESSION_KEY = 'ulamayi-eleves-parents-session';

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = () => {
  const rawSession = localStorage.getItem(SESSION_KEY);
  return rawSession ? JSON.parse(rawSession) : null;
};

export const getUser = () => getSession()?.utilisateur ?? null;

export const getUserRole = () => getUser()?.role ?? null;

export const isAuthenticated = () => Boolean(getSession()?.token);

export const hasRole = (...roles) => {
  const role = getUserRole();
  return role ? roles.includes(role) : false;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
