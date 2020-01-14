import { useState, useEffect } from "react";
import { Pr, Ref, getContent, getPr, getDiff, getFiles } from "./api";

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

export interface PrState {
  pr: Pr;
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
      const nextState = await prState(owner, repo, pr);
      const nextChildren = path
        ? await children(
            nextState.pr,
            nextState.head,
            path,
            nextState.diffFiles
          )
        : null;
      setData(prevState => {
        if (prevState && nextChildren && path) {
          nextState.root = mergeChildren(prevState.root, path, nextChildren);
        }
        return { ...nextState };
      });
    }
    run();
  }, [owner, repo, pr, path]);
  return data;
}

export function useDiff({
  pr,
  base,
  head,
  obj
}: {
  pr: Pr;
  base: Ref;
  head: Ref;
  obj: TreeObject;
}) {
  const [data, setData] = useState<DiffState | null>(null);
  useEffect(() => {
    function fetchOriginal() {
      if (obj.status === "added") {
        return "";
      }
      return getContent(pr, base, obj.path);
    }
    function fetchModified() {
      if (obj.status === "removed") {
        return "";
      }
      return getContent(pr, head, obj.path);
    }

    async function run() {
      const original = await fetchOriginal();
      const modified = await fetchModified();
      setData({ original, modified, filename: obj.path });
    }
    run();
  }, [pr, base, head, obj]);
  return data;
}

function mergeChildren(
  root: TreeObject,
  path: string,
  children: TreeObject[]
): TreeObject {
  const result: TreeObject = JSON.parse(JSON.stringify(root)); // Deep copy.
  const segments = path.split("/");
  let cur = result;
  for (const seg of segments) {
    cur = cur.children.find(c => c.name === seg)!;
  }
  if (cur.children.length > 0) {
    return result;
  }
  cur.children = children;
  return result;
}

async function root(
  pr: Pr,
  ref: Ref,
  diffFiles: FileDiff[]
): Promise<TreeObject> {
  return {
    type: "folder",
    path: "/",
    name: "/",
    status: "unchanged",
    children: await children(pr, ref, "", diffFiles)
  };
}

async function children(
  pr: Pr,
  ref: Ref,
  path: string,
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

  const contents = await getFiles(pr, ref, path);
  if (contents.type === "file") {
    return [];
  }
  return Promise.all(
    contents.map(
      (c: any): TreeObject => {
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

async function diff(pr: Pr) {
  const diff = await getDiff(pr);
  const diffFiles: FileDiff[] = diff.files.map(f => ({
    additions: f.additions,
    changes: f.changes,
    deletions: f.deletions,
    filename: f.filename,
    url: f.raw_url,
    sha: f.sha,
    status: f.status as "added" | "modified" | "removed"
  }));
  const commits: Commit[] = diff.commits.map(c => ({
    sha: c.sha,
    message: c.commit.message,
    author: {
      login: c.author.login,
      avatarUrl: c.author.avatar_url
    }
  }));
  return { diffFiles, commits };
}

async function prState(
  owner: string,
  repo: string,
  number: number
): Promise<PrState> {
  const [pr, pull] = await getPr(owner, repo, number);
  const { diffFiles, commits } = await diff(pr);

  return {
    title: pull.title,
    pr,
    description: pull.body,
    state: pull.state,
    number: pull.number,
    author: pull.user.login,
    owner,
    repo,
    root: await root(pr, pr.head, diffFiles),
    head: pr.head,
    base: pr.base,
    diffFiles,
    commits
  };
}
