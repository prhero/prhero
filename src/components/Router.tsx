import React from "react";
import { App } from "./App";
import { Info } from "./Info";

function getParams() {
  if (window.location.search) {
    const search = new URLSearchParams(window.location.search);
    if (search.has("owner") && search.has("repo") && search.has("pr")) {
      return {
        owner: search.get("owner")!,
        repo: search.get("repo")!,
        pr: Number(search.get("pr"))
      };
    }
  }

  const path = window.location.pathname.split("/");
  if (path.length === 5) {
    const [owner, repo, pull, pr] = path.splice(1);
    if (pull !== "pull") {
      return;
    }
    return { owner, repo, pr: Number(pr) };
  }
}

export function Router() {
  const params = getParams();
  if (params) {
    return <App {...params} />;
  }
  return <Info />;
}
