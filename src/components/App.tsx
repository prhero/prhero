import React, { useState, useEffect } from "react";
import { usePrState } from "../state/github";
import { Flex } from "./Flex";
import { Tree } from "./Tree";
import { Diff } from "./Diff";
import { EditorHeader } from "./Editor";
import { PrBody } from "./Pr";

export interface Props {
  owner: string;
  repo: string;
  pr: number;
}

export function App({ owner, repo, pr }: Props) {
  const [selected, setSelected] = useState<string>();
  const prState = usePrState(owner, repo, pr);

  useEffect(() => {
    if (!selected && prState) {
      setSelected(prState.diffFiles[0].filename);
    }
  }, [prState, selected]);

  if (!prState || !selected) {
    return <div>Loading...</div>;
  }

  return (
    <main className="App bg-secondary full-height">
      <Flex.Container className="full-height">
        <Flex.Child flex={1} className="position-relative full-height">
          <PrBody {...prState} />
          <Tree
            selected={selected}
            onSelect={setSelected}
            changedFiles={prState.diffFiles.map(f => f.filename)}
            {...prState.root}
          />
        </Flex.Child>
        <Flex.Child flex={5} className="bg-primary full-height">
          <EditorHeader>{selected}</EditorHeader>
          <Diff base={prState.base} head={prState.head} selected={selected} />
        </Flex.Child>
      </Flex.Container>
    </main>
  );
}
