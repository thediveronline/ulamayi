export const getHashQueryParam = (key) => {
  const query = window.location.hash.split('?')[1] || '';
  return new URLSearchParams(query).get(key);
};
