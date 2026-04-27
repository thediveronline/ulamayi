const normalizeHash = () => {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
};

export const createRouter = (routes) => {
  const listeners = [];

  const resolve = () => {
    const currentPath = normalizeHash();
    const route = routes.find((item) => item.path === currentPath) ?? routes.find((item) => item.path === '/404');
    listeners.forEach((listener) => listener(route));
  };

  return {
    subscribe(listener) {
      listeners.push(listener);
    },
    start() {
      window.addEventListener('hashchange', resolve);
      resolve();
    }
  };
};
