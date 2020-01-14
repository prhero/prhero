import Octokit from "@octokit/rest";
import { cached } from "./cache";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const url = params.get("url");

const client = new Octokit({
  auth: token || undefined,
  baseUrl: url || undefined,
});

export interface Pr {
  key: string;
  number: number;
  owner: string;
  repo: string;
  head: Ref;
  base: Ref;
}

export interface Ref {
  ref: string;
  sha: string;
  owner: string;
  repo: string;
  fullRef: string;
}

export async function getMyPrs() {
  try {
    const me = await client.users.getAuthenticated();
    return await client.search.issuesAndPullRequests({
      q: `state:open+type:pr+author:${me.data.login}`,
    });
  } catch (err) {
    return await client.search.issuesAndPullRequests({
      q: `state:open+type:pr`,
    });
  }
}

export function getContent(pr: Pr, { owner, repo, ref }: Ref, path: string) {
  return cached(pr.key, `content/${owner}/${repo}/${ref}/${path}`, () => {
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
  });
}

export function getDiff({ key, owner, repo, base, head }: Pr) {
  return cached(key, 'diff', () => {
    return client.repos
      .compareCommits({
        owner,
        repo,
        base: base.fullRef,
        head: head.fullRef
      })
      .then(r => r.data);
  });
}

export function getFiles(
  { key }: Pr,
  { owner, repo, ref }: Ref,
  path: string
): Promise<any> {
  return cached(key, `files/${owner}/${repo}/${ref}/${path}`, () => {
    return client.repos
      .getContents({
        owner,
        repo,
        ref,
        path
      })
      .then(r => r.data) as any;
  });
}

export async function getPr(
  owner: string,
  repo: string,
  number: number
): Promise<[Pr, Octokit.PullsGetResponse]> {
  const pull = await client.pulls
    .get({
      owner,
      repo,
      pull_number: number
    })
    .then(r => r.data);
  const pr: Pr = {
    owner,
    repo,
    number: pull.number,
    key: `${owner}/${repo}/${pull.number}/${pull.head.sha}/${pull.base.sha}`,
    base: getRef(pull.base),
    head: getRef(pull.head)
  };
  return [pr, pull];
}

function getRef(data: any): Ref {
  return {
    owner: data.repo.owner.login,
    repo: data.repo.name,
    ref: data.ref,
    sha: data.sha,
    fullRef: `${data.repo.owner.login}:${data.ref}`
  };
}
