import React, { useState, useEffect } from "react";
import { usePrState, TreeObject } from "../state/github";
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
  function defaultSelected(root: TreeObject) {
    return (
      root.children.find(el => el.name.toLowerCase().includes("readme")) ||
      root.children[0]
    );
  }

  const [opened, setOpened] = useState<string>();
  const [selected, setSelected] = useState<TreeObject | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const prState = usePrState(owner, repo, pr, opened);

  useEffect(() => {
    if (!selected && prState) {
      setSelected(defaultSelected(prState.root));
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
        <Flex.Item width="300px" height="100%">
          <Tree
            onOpen={setOpened}
            selected={selected}
            onSelect={setSelected}
            hovered={hovered}
            onHover={setHovered}
            {...prState.root}
          />
        </Flex.Item>
        <Flex.Item flex={1} height="100%">
          <EditorHeader>{selected.path}</EditorHeader>
          <Diff
            pr={prState.pr}
            base={prState.base}
            head={prState.head}
            selected={selected}
          />
        </Flex.Item>
      </Flex>
    </main>
  );
}
