const normalizeHash = () => {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const path = hash.split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const compilePattern = (pattern) => {
  const keys = [];
  const regexSource = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp(`^${regexSource}$`), keys };
};

const matchRoute = (routes, currentPath) => {
  for (const route of routes) {
    const { regex, keys } = compilePattern(route.path);
    const result = regex.exec(currentPath);
    if (result) {
      const params = {};
      keys.forEach((key, index) => {
        params[key] = decodeURIComponent(result[index + 1]);
      });
      return { route, params };
    }
  }
  return null;
};

export const createRouter = (routes) => {
  const listeners = [];

  const resolve = () => {
    const currentPath = normalizeHash();
    const matched = matchRoute(routes, currentPath)
      ?? matchRoute(routes, '/404')
      ?? { route: routes[0], params: {} };

    listeners.forEach((listener) => listener(matched.route, { params: matched.params, path: currentPath }));
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
