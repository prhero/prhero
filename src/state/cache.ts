const cache: { [k: string]: any } = {};

export async function cached<T>(
  ns: string,
  id: string,
  load: () => Promise<T>
): Promise<T> {
  const key = `${ns}:${id}`;
  if (cache[key]) {
    return cache[key];
  }
  cache[key] = await load();
  return cache[key];
}
