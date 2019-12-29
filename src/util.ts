export function basename(str: string) {
  return str.substr(str.lastIndexOf("/") + 1);
}

export function dirname(str: string) {
  return str.substr(0, str.lastIndexOf("/"));
}
