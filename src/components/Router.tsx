import React from "react";
import { App } from "./App";
import { Info } from "./Info";

export function Router() {
  const path = window.location.hash.replace("#", "").split("/").filter(s => !!s);
  console.log(path)
  if (path.length !== 3) {
    return <Info />
  }
  const [owner, repo, pr] = path;
  return <App owner={owner} repo={repo} pr={Number(pr)} />;
}
