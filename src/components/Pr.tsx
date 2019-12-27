import React from "react";
import { PrState } from "../state/github";

export function PrBody({ owner, repo, number, title, description }: PrState) {
  return (
    <div className="p-1">
      <p>
        <a target="_blank" rel="noopener noreferrer" href={`https://github.com/${owner}/${repo}/pull/${number}`}>
          {owner}/{repo}#{number}
        </a>
      </p>
      <h3 className="text-center">{title}</h3>
      <p>
        {description}
      </p>
    </div>
  );
}
