import React, { useState, useEffect } from "react";
import { usePrState } from "../state/github";
import { Tree } from "./Tree";
import { Diff } from "./Diff";
import { EditorHeader } from "./Editor";
import { PrTitle } from "./Pr";
import { Flex } from "@primer/components";

export interface Props {
  owner: string;
  repo: string;
  pr: number;
}

export function App({ owner, repo, pr }: Props) {
  const [opened, setOpened] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [hovered, setHovered] = useState<string | null>(null);
  const prState = usePrState(owner, repo, pr, opened);

  useEffect(() => {
    if (!selected && prState) {
      setSelected(prState.diffFiles[0].filename);
    }
  }, [prState, selected]);

  if (!prState || !selected) {
    return <div>Loading...</div>;
  }

  return (
    <main className="App" style={{ height: "100%" }}>
      <Flex height="70px">
        <PrTitle {...prState} />
      </Flex>
      <Flex height="calc(100% - 70px)">
        <Flex.Item width="300px" height="100%" overflowY="scroll">
          <Tree
            onOpen={setOpened}
            selected={selected}
            onSelect={setSelected}
            hovered={hovered}
            onHover={setHovered}
            changedFiles={prState.diffFiles.map(f => f.filename)}
            {...prState.root}
          />
        </Flex.Item>
        <Flex.Item flex={1} height="100%">
          <EditorHeader>{selected}</EditorHeader>
          <Diff base={prState.base} head={prState.head} selected={selected} />
        </Flex.Item>
      </Flex>
    </main>
  );
}
