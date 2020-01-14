const cache: { [k: string]: { [k: string]: any } } = {};

const version = process.env.REACT_APP_VERSION || "dev";

(() => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`prhero/${version}`)) {
      const ns = key.split("#").pop()!;
      cache[ns] = JSON.parse(localStorage.getItem(key)!);
    }
  });
})();

function saveCache(ns: string) {
  localStorage.setItem(`prhero/${version}#${ns}`, JSON.stringify(cache[ns]));
}

export async function cached<T>(
  ns: string,
  key: string,
  load: () => Promise<T>
): Promise<T> {
  if (cache[ns] && cache[ns][key]) {
    return cache[ns][key];
  }
  if (!cache[ns]) {
    cache[ns] = {};
  }
  cache[ns][key] = await load();
  setTimeout(() => saveCache(ns), 1);
  return cache[ns][key];
}
