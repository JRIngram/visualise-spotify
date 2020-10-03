// Get the hash of the url
const getHashParams = function () {
  const hashParams = {};
  let e; const r = /([^&;=]+)=?([^&;]*)/g;
  const q = window.location.hash.substring(1);
  e = r.exec(q);
  while (e) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
    e = r.exec(q);
  }
  return hashParams;
};

export default getHashParams;
