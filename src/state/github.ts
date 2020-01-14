import { useState, useEffect } from "react";
import Octokit from "@octokit/rest";

const client = new Octokit();

export type FileStatus = "added" | "modified" | "removed" | "unchanged";

export interface FileDiff {
  additions: number;
  changes: number;
  deletions: number;
  filename: string;
  url: string;
  sha: string;
  status: FileStatus;
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    avatarUrl: string;
    login: string;
  };
}

export interface Ref {
  ref: string;
  sha: string;
  repo: {
    owner: string;
    name: string;
  };
}

export interface PrState {
  title: string;
  author: string;
  description: string;
  owner: string;
  repo: string;
  state: string;
  number: number;
  diffFiles: FileDiff[];
  commits: Commit[];
  root: TreeObject;
  base: Ref;
  head: Ref;
}

export interface DiffState {
  original: string;
  modified: string;
  filename: string;
}

export interface TreeObject {
  type: "file" | "folder";
  name: string;
  path: string;
  status: FileStatus;
  children: TreeObject[];
}

export function usePrState(
  owner: string,
  repo: string,
  pr: number,
  path?: string
) {
  const [data, setData] = useState<PrState | null>(null);
  useEffect(() => {
    async function run() {
      let state = await loadPrStateCached(owner, repo, pr);
      if (data) {
        state.root = data.root;
      }
      if (path) {
        const nextRoot = await mergeChildren(
          state.root,
          state.head.repo.owner,
          state.head.repo.name,
          state.head.ref,
          path,
          state.diffFiles
        );
        state = { ...state, root: nextRoot };
      }
      setData(state);
    }
    run();
  }, [owner, repo, pr, path]);
  return data;
}

export function useDiff({
  base,
  head,
  obj
}: {
  base: Ref;
  head: Ref;
  obj: TreeObject;
}) {
  const [data, setData] = useState<DiffState | null>(null);
  useEffect(() => {
    async function run() {
      const original =
        obj.status === "added"
          ? ""
          : await getContentCached(
              base.repo.owner,
              base.repo.name,
              base.ref,
              obj.path
            );
      const modified =
        obj.status === "removed"
          ? ""
          : await getContentCached(
              head.repo.owner,
              head.repo.name,
              head.ref,
              obj.path
            );
      setData({ original, modified, filename: obj.path });
    }
    run();
  }, [base, head, obj]);
  return data;
}

async function loadRoot(
  owner: string,
  repo: string,
  ref: string,
  diffFiles: FileDiff[]
): Promise<TreeObject> {
  const children = await getChildren(owner, repo, "", ref, diffFiles);
  return {
    type: "folder",
    path: "/",
    name: "/",
    status: "unchanged",
    children
  };
}

async function mergeChildren(
  root: TreeObject,
  owner: string,
  repo: string,
  ref: string,
  path: string,
  diffFiles: FileDiff[]
): Promise<TreeObject> {
  const result: TreeObject = JSON.parse(JSON.stringify(root)); // Deep copy.
  const segments = path.split("/");

  let cur = result;
  for (const seg of segments) {
    cur = cur.children.find(c => c.name === seg)!;
  }

  if (cur.children.length > 0) {
    return result;
  }
  cur.children = await getChildren(owner, repo, path, ref, diffFiles);
  return result;
}

async function getChildren(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  diffFiles: FileDiff[]
): Promise<TreeObject[]> {
  function fileStatus(type: "folder" | "file", path: string) {
    if (type === "folder") {
      return diffFiles.find(f => f.filename.startsWith(path))
        ? "modified"
        : "unchanged";
    }
    const diff = diffFiles.find(f => f.filename === path);
    if (diff) {
      return diff.status;
    }
    return "unchanged";
  }

  const contents = (await client.repos
    .getContents({
      owner,
      repo,
      ref,
      path
    })
    .then(r => r.data)) as any;
  if (contents.type === "file") {
    return [];
  }
  return Promise.all(
    contents.map(
      async (c: any): Promise<TreeObject> => {
        if (c.type === "dir") {
          return {
            type: "folder",
            name: c.name,
            path: c.path,
            status: fileStatus("folder", c.path),
            children: []
          };
        }
        return {
          type: "file",
          name: c.name,
          path: c.path,
          status: fileStatus("file", c.path),
          children: []
        };
      }
    )
  );
}

let cache: { [k: string]: any } = {};

(function() {
  const raw = localStorage.getItem("cache");
  if (raw) {
    cache = JSON.parse(raw);
  }
  setInterval(() => {
    localStorage.setItem("cache", JSON.stringify(cache));
  }, 1000);
})();

async function loadPrStateCached(
  owner: string,
  repo: string,
  number: number
): Promise<PrState> {
  const version = "v2";
  const key = `${owner}.${repo}.${number}.${version}`;
  const val = cache[key];
  if (val) {
    return val;
  }

  const state = await loadPrState(owner, repo, number);
  cache[key] = state;
  return state;
}

async function getContentCached(
  owner: string,
  repo: string,
  ref: string,
  path: string
) {
  const version = "v1";
  const key = `${owner}.${repo}.${ref}.${path}.${version}`;
  const val = cache[key];
  if (val) {
    return val;
  }

  const content = await getContent(owner, repo, ref, path);
  cache[key] = content;
  return content;
}

function getContent(owner: string, repo: string, ref: string, path: string) {
  return client.repos
    .getContents({
      owner,
      repo,
      ref,
      path,
      headers: {
        accept: "application/vnd.github.v3.raw"
      }
    })
    .then(r => r.data) as Promise<string>;
}

async function loadPrState(
  owner: string,
  repo: string,
  number: number
): Promise<PrState> {
  const pull = await client.pulls
    .get({
      owner,
      repo,
      pull_number: number
    })
    .then(r => r.data);
  const diff = await client.repos
    .compareCommits({
      owner,
      repo,
      base: `${pull.base.repo.owner.login}:${pull.base.ref}`,
      head: `${pull.head.repo.owner.login}:${pull.head.ref}`
    })
    .then(r => r.data);
  const diffFiles = diff.files.map(f => ({
    additions: f.additions,
    changes: f.changes,
    deletions: f.deletions,
    filename: f.filename,
    url: f.raw_url,
    sha: f.sha,
    status: f.status as "added" | "modified" | "removed"
  }));
  const root = await loadRoot(
    pull.head.repo.owner.login,
    pull.head.repo.name,
    pull.head.ref,
    diffFiles
  );

  return {
    title: pull.title,
    description: pull.body,
    state: pull.state,
    number: pull.number,
    author: pull.user.login,
    owner,
    repo,
    root,
    base: {
      repo: {
        owner: pull.base.repo.owner.login,
        name: pull.base.repo.name
      },
      ref: pull.base.ref,
      sha: pull.base.sha
    },
    head: {
      repo: {
        owner: pull.head.repo.owner.login,
        name: pull.head.repo.name
      },
      ref: pull.head.ref,
      sha: pull.head.sha
    },
    diffFiles,
    commits: diff.commits.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      author: {
        login: c.author.login,
        avatarUrl: c.author.avatar_url
      }
    }))
  };
}
