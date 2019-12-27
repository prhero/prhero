import { useState, useEffect } from "react";
import Octokit from "@octokit/rest";

const client = new Octokit();

export interface FileDiff {
  additions: number;
  changes: number;
  deletions: number;
  filename: string;
  url: string;
  sha: string;
  status: string;
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
  children: TreeObject[];
}

export function usePrState(owner: string, repo: string, pr: number) {
  const [data, setData] = useState<PrState | null>(null);
  useEffect(() => {
    loadPrStateCached(owner, repo, pr).then(setData);
  }, [owner, repo, pr]);
  return data;
}

export function useDiff({
  base,
  head,
  path
}: {
  base: Ref;
  head: Ref;
  path: string;
}) {
  const [data, setData] = useState<DiffState | null>(null);
  useEffect(() => {
    async function run() {
      const original = await getContentCached(
        base.repo.owner,
        base.repo.name,
        base.ref,
        path
      );
      const modified = await getContentCached(
        head.repo.owner,
        head.repo.name,
        head.ref,
        path
      );
      setData({ original, modified, filename: path });
    }
    run();
  }, [base, head, path]);
  return data;
}

async function loadRoot(
  owner: string,
  repo: string,
  ref: string,
): Promise<TreeObject> {
  const children = await getChildren(owner, repo, "", ref);
  return {
    type: "folder",
    path: "/",
    name: "/",
    children
  };
}

async function getChildren(
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<TreeObject[]> {
  const contents = (await client.repos
    .getContents({
      owner,
      repo,
      ref,
      path
    })
    .then(r => r.data)) as any;
  return Promise.all(
    contents.map(
      async (c: any): Promise<TreeObject> => {
        if (c.type === "dir") {
          return {
            type: "folder",
            name: c.name,
            path: c.path,
            children: await getChildren(owner, repo, c.path, ref)
          };
        }
        return {
          type: "file",
          name: c.name,
          path: c.path,
          children: []
        };
      }
    )
  );
}

async function loadPrStateCached(
  owner: string,
  repo: string,
  number: number
): Promise<PrState> {
  const version = "3";
  const key = `${owner}.${repo}.${number}.${version}`;
  const val = localStorage.getItem(key);
  if (val) {
    return JSON.parse(val);
  }

  const state = await loadPrState(owner, repo, number);
  localStorage.setItem(key, JSON.stringify(state));
  return state;
}

async function getContentCached(
  owner: string,
  repo: string,
  ref: string,
  path: string
) {
  const version = "3";
  const key = `${owner}.${repo}.${ref}.${path}.${version}`;
  const val = localStorage.getItem(key);
  if (val) {
    return val;
  }

  const content = await getContent(owner, repo, ref, path);
  localStorage.setItem(key, content);
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
    status: f.status
  }));
  const root = await loadRoot(pull.head.repo.owner.login, pull.head.repo.name, pull.head.ref);

  return {
    title: pull.title,
    description: pull.body,
    state: pull.state,
    number: pull.number,
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
