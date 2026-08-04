const normalizeHash = () => {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
};

const matchRoute = (routes, path) => {
  for (const route of routes) {
    const paramNames = [];
    const pattern = route.path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${pattern}$`);
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1]);
      });
      return { route, params };
    }
  }
  const notFound = routes.find((item) => item.path === '/404');
  return { route: notFound, params: {} };
};

export const createRouter = (routes) => {
  const listeners = [];

  const resolve = () => {
    const currentPath = normalizeHash();
    const { route, params } = matchRoute(routes, currentPath);
    listeners.forEach((listener) => listener(route, params));
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
